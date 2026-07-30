namespace EasyTrade.BrokerService.Entities.Trades.Service;

public interface ITradeService
{
    public Task<Trade> BuyAssets(Guid accountId, Guid instrumentId, decimal amount);
    public Task<Trade> SellAssets(Guid accountId, Guid instrumentId, decimal amount);
    public Task<IEnumerable<Trade>> GetTradesOfAccount(
        Guid accountId,
        int count,
        int page,
        bool onlyOpen = false,
        bool onlyLong = false
    );
}
