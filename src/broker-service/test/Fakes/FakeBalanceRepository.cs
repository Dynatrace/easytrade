using EasyTrade.BrokerService.Entities.Balances;
using EasyTrade.BrokerService.Entities.Balances.Repository;

namespace EasyTrade.BrokerService.Test.Fakes;

public class FakeBalanceRepository : IBalanceRepository
{
    private readonly List<Balance> _balances = [];
    private readonly List<BalanceHistory> _balanceHistories = [];

    public FakeBalanceRepository(List<Balance> balances, List<BalanceHistory> balanceHistories)
    {
        (_balances, _balanceHistories) = (balances, balanceHistories);
    }

    public FakeBalanceRepository() { }

    public FakeBalanceRepository AddBalance(Balance balance)
    {
        _balances.Add(balance);
        return this;
    }

    public List<BalanceHistory> GetBalanceHistories() => _balanceHistories;

    public Balance? GetBalanceOfAccount(Guid accountId) => _balances.Find(x => x.AccountId == accountId);

    public Task<Balance?> GetBalanceOfAccountAsync(Guid accountId)
    {
        var balance = _balances.Find(x => x.AccountId == accountId);
        return Task.FromResult(balance);
    }

    public Task<BalanceHistory> AddBalanceHistoryAsync(BalanceHistory balanceHistory)
    {
        _balanceHistories.Add(balanceHistory);
        return Task.FromResult(balanceHistory);
    }

    public Task<Balance> UpdateBalanceAsync(Balance balance)
    {
        var current = _balances.Find(x => x.AccountId == balance.AccountId);
        if (current is not null)
        {
            current.Value = balance.Value;
        }
        return Task.FromResult(balance);
    }
}
