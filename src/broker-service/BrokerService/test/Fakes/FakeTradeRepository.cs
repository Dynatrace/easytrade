using EasyTrade.BrokerService.Entities.Trades;
using EasyTrade.BrokerService.Entities.Trades.Repository;
using EasyTrade.BrokerService.Test.Helpers;

namespace EasyTrade.BrokerService.Test.Fakes;

public class FakeTradeRepository : FakeTransactionalRepository, ITradeRepository
{
    private readonly List<Trade> _trades = new();

    public FakeTradeRepository(List<Trade> trades) => _trades = trades;

    public FakeTradeRepository() { }

    public virtual void AddTrade(Trade trade) => _trades.Add(trade);

    public FakeTradeRepository Add(Trade trade)
    {
        _trades.Add(trade);
        return this;
    }

    public IQueryable<Trade> GetAllTrades() => _trades.AsAsyncQueryable();

    public void UpdateTrade(Trade trade)
    {
        var current = _trades.First(x => x.Id == trade.Id);
        current = trade;
    }
}
