using EasyTrade.BrokerService.Entities.Portfolio.DTO;
using EasyTrade.BrokerService.Entities.Prices;

namespace EasyTrade.BrokerService.Entities.Portfolio.Service;

internal class PortfolioValuation(Dictionary<Guid, decimal> holdingQuantitiesByInstrument, IReadOnlyDictionary<Guid, List<Price>> priceHistoryByInstrument)
{
    public IEnumerable<PortfolioPointDTO> BuildPoints(IEnumerable<DateTimeOffset> bucketTimestamps) =>
        bucketTimestamps.Select(bucketTime => new PortfolioPointDTO(bucketTime, ValueAt(bucketTime)));

    private decimal ValueAt(DateTimeOffset asOf) =>
        holdingQuantitiesByInstrument.Sum(holding => ValueHoldingAt(holding.Key, holding.Value, asOf) ?? 0);

    private decimal? ValueHoldingAt(Guid instrumentId, decimal quantity, DateTimeOffset asOf)
    {
        if (!priceHistoryByInstrument.TryGetValue(instrumentId, out var priceHistory))
            return null;

        var priceAsOf = FindPriceAtOrBefore(priceHistory, asOf);
        return priceAsOf is null ? null : quantity * priceAsOf.Close;
    }

    // pricesSortedByTime is sorted ascending, so the rightmost match found by
    // scanning backward from the tail is the newest price at/before `target`.
    // Falls back to the oldest available price when none precede it.
    private static Price? FindPriceAtOrBefore(List<Price> pricesSortedByTime, DateTimeOffset target)
    {
        if (pricesSortedByTime.Count == 0)
            return null;

        return pricesSortedByTime[Math.Max(pricesSortedByTime.FindLastIndex(price => price.Timestamp <= target), 0)];
    }
}
