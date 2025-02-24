namespace EasyTrade.BrokerService.Entities.Trades.Service;

public interface ILongTradeService
{
    public Task<Trade> BuyAssets(
        int accountId,
        int instrumentId,
        decimal amount,
        int duration,
        decimal price
    );
    public Task<Trade> SellAssets(
        int accountId,
        int instrumentId,
        decimal amount,
        int duration,
        decimal price
    );
    public Task ProcessLongRunningTransactions();
}
