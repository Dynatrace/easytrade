namespace EasyTrade.BrokerService.Entities.Trades.Service;

public interface ILongTradeService
{
    public Task<Trade> BuyAssets(
        Guid accountId,
        Guid instrumentId,
        decimal amount,
        int duration,
        decimal price
    );
    public Task<Trade> SellAssets(
        Guid accountId,
        Guid instrumentId,
        decimal amount,
        int duration,
        decimal price
    );
    public Task ProcessLongRunningTransactions();
}
