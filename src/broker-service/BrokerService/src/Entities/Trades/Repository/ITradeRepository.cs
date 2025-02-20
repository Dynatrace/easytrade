using EasyTrade.BrokerService.Helpers;

namespace EasyTrade.BrokerService.Entities.Trades.Repository;

public interface ITradeRepository : ITransactionalRepository
{
    public void AddTrade(Trade trade);
    public void UpdateTrade(Trade trade);
    public IQueryable<Trade> GetAllTrades();
}
