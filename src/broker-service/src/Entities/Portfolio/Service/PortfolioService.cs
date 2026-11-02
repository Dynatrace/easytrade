using EasyTrade.BrokerService.Entities.Instruments.Repository;
using EasyTrade.BrokerService.Entities.Portfolio.DTO;
using EasyTrade.BrokerService.Entities.Prices.ServiceConnector;

namespace EasyTrade.BrokerService.Entities.Portfolio.Service;

public class PortfolioService(
    IInstrumentRepository instrumentRepository,
    IPriceServiceConnector priceService,
    ILogger<PortfolioService> logger
) : IPortfolioService
{
    private static readonly TimeSpan PeriodLength = TimeSpan.FromHours(24);
    private static readonly TimeSpan BucketSize = TimeSpan.FromMinutes(1);

    public async Task<IEnumerable<PortfolioPointDTO>> GetPortfolioHistoryAsync(Guid accountId)
    {
        logger.LogInformation("Computing portfolio history for account [{accountId}]", accountId);

        var start = DateTimeOffset.UtcNow - PeriodLength;

        var holdingsTask = GetCurrentHoldingsAsync(accountId);
        var pricesTask = priceService.GetAllPricesAscByTimestamp(start);
        await Task.WhenAll(holdingsTask, pricesTask);
        var bucketTimestamps = BuildBucketTimestamps(start);

        return new PortfolioValuation(holdingsTask.Result, pricesTask.Result).BuildPoints(bucketTimestamps);
    }
    private async Task<Dictionary<Guid, decimal>> GetCurrentHoldingsAsync(Guid accountId)
    {
        var ownedInstruments = await instrumentRepository.GetOwnedInstrumentsOfAccountAsync(accountId);

        return ownedInstruments
            .Where(instrument => instrument.Quantity > 0)
            .ToDictionary(instrument => instrument.InstrumentId, instrument => instrument.Quantity);
    }

    private static IEnumerable<DateTimeOffset> BuildBucketTimestamps(DateTimeOffset start)
    {
        var bucketCount = (int)(PeriodLength / BucketSize);
        return Enumerable.Range(1, bucketCount).Select(i => start + BucketSize * i);
    }
}
