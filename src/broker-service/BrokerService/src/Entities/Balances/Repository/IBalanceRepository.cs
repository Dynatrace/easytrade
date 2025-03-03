using EasyTrade.BrokerService.Helpers;

namespace EasyTrade.BrokerService.Entities.Balances.Repository;

public interface IBalanceRepository : ITransactionalRepository
{
    public void AddBalanceHistory(BalanceHistory balanceHistory);
    public Task<Balance?> GetBalanceOfAccount(int accountId);
    public void UpdateBalance(Balance balance);
}
