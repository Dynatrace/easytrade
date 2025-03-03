namespace EasyTrade.BrokerService.Entities.Trades.Service;

public interface ITradeService
{
    public Task<Trade> BuyAssets(int accountId, int instrumentId, decimal amount);
    public Task<Trade> SellAssets(int accountId, int instrumentId, decimal amount);
    public Task<IEnumerable<Trade>> GetTradesOfAccount(
        int accountId,
        int count,
        int page,
        bool onlyOpen = false,
        bool onlyLong = false
    );
}
