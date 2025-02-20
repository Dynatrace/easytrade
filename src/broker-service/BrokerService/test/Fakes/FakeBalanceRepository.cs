using EasyTrade.BrokerService.Entities.Balances;
using EasyTrade.BrokerService.Entities.Balances.Repository;
using EasyTrade.BrokerService.Test.Helpers;

namespace EasyTrade.BrokerService.Test.Fakes;

public class FakeBalanceRepository : FakeTransactionalRepository, IBalanceRepository
{
    private readonly List<Balance> _balances = new();
    private readonly List<BalanceHistory> _balanceHistories = new();

    public FakeBalanceRepository(List<Balance> balances, List<BalanceHistory> balanceHistories) =>
        (_balances, _balanceHistories) = (balances, balanceHistories);

    public FakeBalanceRepository() { }

    public FakeBalanceRepository AddBalance(Balance balance)
    {
        _balances.Add(balance);
        return this;
    }

    public void AddBalanceHistory(BalanceHistory balanceHistory) =>
        _balanceHistories.Add(balanceHistory);

    public IQueryable<BalanceHistory> GetBalanceHistories() => _balanceHistories.AsAsyncQueryable();

    public Task<Balance?> GetBalanceOfAccount(int accountId)
    {
        var balance = _balances.Find(x => x.AccountId == accountId);
        return Task.FromResult(balance);
    }

    public void UpdateBalance(Balance balance)
    {
        var current = _balances.Find(x => x.AccountId == balance.AccountId);
        if (current is null)
        {
            return;
        }
        current.Value = balance.Value;
    }
}
