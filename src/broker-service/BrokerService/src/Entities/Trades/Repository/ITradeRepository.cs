namespace EasyTrade.BrokerService.Entities.Trades.Repository;

public interface ITradeRepository
{
    Task<Trade> CreateTradeAsync(Trade trade);

    Task<Trade> UpdateTradeAsync(Trade trade);

    Task<List<Trade>> GetOpenTradesAsync();

    Task<List<Trade>> GetExpiredTradesAsync();

    Task<List<Trade>> GetAccountTradesAsync(Guid accountId, bool onlyOpen, bool onlyLong);
}
