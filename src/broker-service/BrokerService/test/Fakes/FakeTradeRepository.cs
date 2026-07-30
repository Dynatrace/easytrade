using EasyTrade.BrokerService.Entities.Trades;
using EasyTrade.BrokerService.Entities.Trades.Repository;

namespace EasyTrade.BrokerService.Test.Fakes;

public class FakeTradeRepository : ITradeRepository
{
    private readonly List<Trade> _trades = new();

    public FakeTradeRepository(List<Trade> trades) => _trades = trades;

    public FakeTradeRepository() { }

    public FakeTradeRepository Add(Trade trade)
    {
        _trades.Add(trade);
        return this;
    }

    public List<Trade> GetAllTrades() => _trades;

    public Task<Trade> CreateTradeAsync(Trade trade)
    {
        _trades.Add(trade);
        return Task.FromResult(trade);
    }

    public Task<Trade> UpdateTradeAsync(Trade trade)
    {
        var index = _trades.FindIndex(x => x.Id == trade.Id);
        if (index >= 0)
            _trades[index] = trade;
        return Task.FromResult(trade);
    }

    public Task<List<Trade>> GetOpenTradesAsync() =>
        Task.FromResult(_trades.Where(x => !x.TradeClosed).ToList());

    public Task<List<Trade>> GetExpiredTradesAsync() =>
        Task.FromResult(_trades.Where(x => x.TimestampClose < DateTimeOffset.UtcNow).ToList());

    public Task<List<Trade>> GetAccountTradesAsync(Guid accountId, bool onlyOpen, bool onlyLong)
    {
        var trades = _trades.Where(x => x.AccountId == accountId);
        if (onlyOpen) trades = trades.Where(x => !x.TradeClosed);
        if (onlyLong) trades = trades.Where(x => x.Direction.Equals("buy", StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(trades.ToList());
    }
}
