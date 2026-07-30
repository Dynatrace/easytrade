using EasyTrade.BrokerService.Entities.Instruments.DTO;
using EasyTrade.BrokerService.Entities.Instruments.Repository;
using EasyTrade.BrokerService.Entities.Prices.ServiceConnector;
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
    private readonly IInstrumentRepository _instrumentRepository = instrumentRepository;
    private readonly IPriceServiceConnector _priceServiceConnector = priceServiceConnector;
    private readonly IProductRepository _productRepository = productRepository;
    private readonly ILogger _logger = logger;

    public async Task<IEnumerable<InstrumentDTO>> GetInstruments(Guid? accountId)
    {
        if (!accountId.HasValue)
            return [];

        _logger.LogInformation("Get instruments with account ID [{accountId}]", accountId);

        var instrumentDtoList = new List<InstrumentDTO>();

        var instruments = await _instrumentRepository.GetAllInstrumentsAsync();
        
        var ownedInstruments = (await _instrumentRepository.GetOwnedInstrumentsOfAccountAsync(accountId.Value)).ToDictionary(
            x => x.InstrumentId,
            x => x
        );
        var prices = (await _priceServiceConnector.GetLatestPrices()).ToDictionary(
            x => x.InstrumentId,
            x => x
        );
        var products = (await _productRepository.GetProductsAsync()).ToDictionary(
            x => x.Id,
            x => x
        );
        foreach (var instrument in instruments)
        {
            var ownedInstrument = ownedInstruments.TryGetValue(instrument.Id, out var value)
                ? value
                : default;
            var price = prices[instrument.Id];
            var product = products[instrument.ProductId];

            var newInstrumentDto = new InstrumentDTO(instrument, ownedInstrument, product, price);
            instrumentDtoList.Add(newInstrumentDto);
        }

        _logger.LogDebug("Instruments: {instruments}", instrumentDtoList.ToJson());
        return instrumentDtoList;
    }
}
