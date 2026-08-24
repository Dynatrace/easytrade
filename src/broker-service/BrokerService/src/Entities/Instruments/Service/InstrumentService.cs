using EasyTrade.BrokerService.Entities.Instruments.DTO;
using EasyTrade.BrokerService.Entities.Instruments.Repository;
using EasyTrade.BrokerService.Entities.Prices;
using EasyTrade.BrokerService.Entities.Prices.ServiceConnector;
using EasyTrade.BrokerService.Entities.Products;
using EasyTrade.BrokerService.Entities.Products.Repository;
using EasyTrade.BrokerService.Helpers;

namespace EasyTrade.BrokerService.Entities.Instruments.Service;

public class InstrumentService(
    IInstrumentRepository instrumentRepository,
    IPriceServiceConnector priceServiceConnector,
    IProductRepository productRepository,
    ILogger<InstrumentService> logger
) : IInstrumentService
{
    public async Task<IEnumerable<InstrumentDTO>> GetInstruments(Guid? accountId)
    {
        if (!accountId.HasValue)
            return [];

        logger.LogInformation("Get instruments with account ID [{accountId}]", accountId);

        var result = BuildInstrumentDtos(await FetchInstrumentSnapshot(accountId.Value));

        logger.LogDebug("Instruments: {instruments}", result.ToJson());
        return result;
    }

    private List<InstrumentDTO> BuildInstrumentDtos(InstrumentSnapshot snapshot)
    {
        var result = new List<InstrumentDTO>();
        foreach (var instrument in snapshot.Instruments)
        {
            var dto = TryBuildInstrumentDto(instrument, snapshot);
            if (dto is null)
            {
                logger.LogWarning(
                    "Skipping instrument [{id}]: missing price or product data",
                    instrument.Id
                );
                continue;
            }
            result.Add(dto);
        }
        return result;
    }

    private static InstrumentDTO? TryBuildInstrumentDto(Instrument instrument, InstrumentSnapshot snapshot)
    {
        if (!snapshot.Prices.TryGetValue(instrument.Id, out var price))
            return null;
        if (!snapshot.Products.TryGetValue(instrument.ProductId, out var product))
            return null;
        var ownedInstrument = snapshot.OwnedInstruments.GetValueOrDefault(instrument.Id);
        return new InstrumentDTO(instrument, ownedInstrument, product, price);
    }

    private async Task<InstrumentSnapshot> FetchInstrumentSnapshot(Guid accountId) =>
        new(
            await instrumentRepository.GetAllInstrumentsAsync(),
            (await instrumentRepository.GetOwnedInstrumentsOfAccountAsync(accountId)).ToDictionary(
                x => x.InstrumentId,
                x => x
            ),
            (await priceServiceConnector.GetLatestPrices()).ToDictionary(
                x => x.InstrumentId,
                x => x
            ),
            (await productRepository.GetProductsAsync()).ToDictionary(x => x.Id, x => x)
        );

    private record InstrumentSnapshot(List<Instrument> Instruments, Dictionary<Guid, OwnedInstrument> OwnedInstruments, Dictionary<Guid, Price> Prices, Dictionary<Guid, Product> Products);
}
