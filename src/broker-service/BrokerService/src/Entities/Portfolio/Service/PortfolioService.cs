using EasyTrade.BrokerService.Entities.Portfolio.DTO;
using EasyTrade.BrokerService.Entities.Prices;
using EasyTrade.BrokerService.Entities.Prices.ServiceConnector;
using EasyTrade.BrokerService.Entities.Trades.Repository;

namespace EasyTrade.BrokerService.Entities.Portfolio.Service;

public class PortfolioService(
    ITradeRepository tradeRepository,
    IPriceServiceConnector priceService,
    ILogger<PortfolioService> logger
) : IPortfolioService
{
    private readonly ITradeRepository _tradeRepository = tradeRepository;
    private readonly IPriceServiceConnector _priceService = priceService;
    private readonly ILogger _logger = logger;

    // Number of pricing candles fetched per instrument. At one candle per hour,
    // 1000 covers ~41 days — enough for the 30d period.
    private const int PriceFetchCount = 1000;

    public async Task<IEnumerable<PortfolioPointDTO>> GetPortfolioHistoryAsync(
        Guid accountId,
        string period
    )
    {
        _logger.LogInformation(
            "Computing portfolio history for account [{accountId}], period [{period}]",
            accountId,
            period
        );

        var (start, bucketCount, bucketSize) = ResolvePeriod(period);

        // All settled trades for this account, oldest first
        var allTrades = await _tradeRepository.GetAccountTradesAsync(
            accountId,
            onlyOpen: false,
            onlyLong: false
        );
        var settledTrades = allTrades
            .Where(t => t.TransactionHappened)
            .OrderBy(t => t.TimestampOpen)
            .ToList();

        // Distinct instruments ever traded in this account
        var instrumentIds = settledTrades.Select(t => t.InstrumentId).Distinct().ToList();
        if (instrumentIds.Count == 0)
        {
            return BuildZeroPoints(start, bucketCount, bucketSize);
        }

        // Fetch historical prices for each instrument in parallel
        var priceTasks = instrumentIds.Select(async id =>
        {
            var prices = await _priceService.GetPricesByInstrumentId(id, PriceFetchCount);
            return (id, prices: prices.OrderBy(p => p.Timestamp).ToList());
        });
        var pricesPerInstrument = (await Task.WhenAll(priceTasks))
            .ToDictionary(x => x.id, x => x.prices);

        // Build time buckets from start+1*size to now, inclusive
        var buckets = Enumerable
            .Range(1, bucketCount)
            .Select(i => start + bucketSize * i)
            .ToList();

        var results = new List<PortfolioPointDTO>(bucketCount);

        foreach (var bucketTime in buckets)
        {
            // Replay trades up to this bucket boundary to derive held quantities
            var quantities = new Dictionary<Guid, decimal>();
            foreach (var trade in settledTrades.Where(t => t.TimestampOpen <= bucketTime))
            {
                quantities.TryAdd(trade.InstrumentId, 0m);
                var delta = trade.Direction is "buy" or "longbuy"
                    ? trade.Quantity
                    : -trade.Quantity;
                quantities[trade.InstrumentId] += delta;
            }

            // Sum quantity × closest closing price for each held instrument
            var totalValue = 0m;
            foreach (var (instrumentId, qty) in quantities.Where(kv => kv.Value > 0))
            {
                if (!pricesPerInstrument.TryGetValue(instrumentId, out var prices))
                    continue;

                var price = ClosestPriceBefore(prices, bucketTime);
                if (price is not null)
                    totalValue += qty * price.Close;
            }

            results.Add(new PortfolioPointDTO(bucketTime, totalValue));
        }

        return results;
    }

    // Returns the newest price whose Timestamp <= target, or the oldest available.
    private static Price? ClosestPriceBefore(List<Price> sorted, DateTimeOffset target)
    {
        // Binary-search-style: last price with Timestamp <= target
        int lo = 0, hi = sorted.Count - 1, best = -1;
        while (lo <= hi)
        {
            int mid = (lo + hi) / 2;
            if (sorted[mid].Timestamp <= target)
            {
                best = mid;
                lo = mid + 1;
            }
            else
            {
                hi = mid - 1;
            }
        }
        return best >= 0 ? sorted[best] : sorted.Count > 0 ? sorted[0] : null;
    }

    private static IEnumerable<PortfolioPointDTO> BuildZeroPoints(
        DateTimeOffset start,
        int count,
        TimeSpan size
    ) =>
        Enumerable
            .Range(1, count)
            .Select(i => new PortfolioPointDTO(start + size * i, 0m));

    private static (DateTimeOffset start, int bucketCount, TimeSpan bucketSize) ResolvePeriod(
        string period
    ) =>
        period switch
        {
            "7d" => (DateTimeOffset.UtcNow.AddDays(-7), 42, TimeSpan.FromHours(4)),
            "30d" => (DateTimeOffset.UtcNow.AddDays(-30), 30, TimeSpan.FromDays(1)),
            _ => (DateTimeOffset.UtcNow.AddDays(-1), 24, TimeSpan.FromHours(1)), // "1d" default
        };
}
