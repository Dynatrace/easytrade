using EasyTrade.BrokerService.Entities.Prices;
using EasyTrade.BrokerService.Entities.Prices.ServiceConnector;

namespace EasyTrade.BrokerService.Test.Fakes;

public class FakePriceServiceConnector : IPriceServiceConnector
{
    private readonly List<Price> _prices = [];

    public FakePriceServiceConnector(List<Price> prices)
    {
        _prices = prices;
    }

    public FakePriceServiceConnector() { }

    public FakePriceServiceConnector AddPrice(Price price)
    {
        _prices.Add(price);
        return this;
    }

    public Task<Price?> GetLastPriceByInstrumentId(Guid id)
    {
        var price = _prices
            .Where(x => x.InstrumentId == id)
            .OrderByDescending(x => x.Timestamp)
            .LastOrDefault();
        return Task.FromResult(price);
    }

    public Task<IEnumerable<Price>> GetLatestPrices()
    {
        if (_prices.Count == 0) return Task.FromResult(Enumerable.Empty<Price>());
        var maxTimestamp = _prices.Max(x => x.Timestamp);
        var prices = _prices.Where(x => x.Timestamp == maxTimestamp);
        return Task.FromResult(prices);
    }

    public Task<IEnumerable<Price>> GetPricesByInstrumentId(Guid id, int count)
    {
        var prices = _prices
            .Where(x => x.InstrumentId == id)
            .OrderByDescending(x => x.Timestamp)
            .Take(count);
        return Task.FromResult(prices);
    }
}
