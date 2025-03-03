namespace EasyTrade.BrokerService.Entities.Balances.Service;

using EasyTrade.BrokerService.Helpers;

public interface IBalanceService
{
    public Task<Balance> Deposit(int accountId, decimal amount);
    public Task<Balance> Withdraw(int accountId, decimal amount);
    public Task<Balance> GetBalanceOfAccount(int accountId);
}
