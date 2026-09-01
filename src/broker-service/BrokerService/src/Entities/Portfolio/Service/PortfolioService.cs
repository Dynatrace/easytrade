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
    public async Task<IEnumerable<PortfolioPointDTO>> GetPortfolioHistoryAsync(Guid accountId, string period)
    {
        logger.LogInformation(
            "Computing portfolio history for account [{accountId}], period [{period}]",
            accountId,
            period
        );

        var (periodLength, bucketSize) = ResolvePeriodWindow(period);
        var start = DateTimeOffset.UtcNow - periodLength;

        var holdingQuantitiesByInstrument = await GetCurrentHoldingsAsync(accountId);
        var priceHistoryByInstrument = await priceService.GetPricesForInstrumentsAscByTimestamp(holdingQuantitiesByInstrument.Keys, start);
        var bucketTimestamps = BuildBucketTimestamps(start, periodLength, bucketSize);

        return new PortfolioValuation(holdingQuantitiesByInstrument, priceHistoryByInstrument).BuildPoints(bucketTimestamps);
    }
    private async Task<Dictionary<Guid, decimal>> GetCurrentHoldingsAsync(Guid accountId)
    {
        var ownedInstruments = await instrumentRepository.GetOwnedInstrumentsOfAccountAsync(accountId);

        return ownedInstruments
            .Where(instrument => instrument.Quantity > 0)
            .ToDictionary(instrument => instrument.InstrumentId, instrument => instrument.Quantity);
    }

    private static (TimeSpan periodLength, TimeSpan bucketSize) ResolvePeriodWindow(string period) =>
        period switch
        {
            "7d" => (TimeSpan.FromDays(7), TimeSpan.FromHours(4)),
            "30d" => (TimeSpan.FromDays(30), TimeSpan.FromDays(1)),
            _ => (TimeSpan.FromDays(1), TimeSpan.FromHours(1)),
        };

    private static IEnumerable<DateTimeOffset> BuildBucketTimestamps(
        DateTimeOffset start,
        TimeSpan periodLength,
        TimeSpan bucketSize
    )
    {
        var bucketCount = (int)(periodLength / bucketSize);
        return Enumerable.Range(1, bucketCount).Select(i => start + bucketSize * i);
    }
}
