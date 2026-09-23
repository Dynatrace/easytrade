namespace EasyTrade.BrokerService.Entities.Balances.Service;

public interface IBalanceService
{
    public Task<Balance> Deposit(Guid accountId, decimal amount);
    public Task<Balance> Withdraw(Guid accountId, decimal amount);
    public Task<Balance> GetBalanceOfAccount(Guid accountId);
}
