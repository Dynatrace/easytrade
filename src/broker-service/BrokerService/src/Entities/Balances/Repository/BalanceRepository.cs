using EasyTrade.BrokerService.Helpers;
using Microsoft.EntityFrameworkCore;

namespace EasyTrade.BrokerService.Entities.Balances.Repository;

public class BalanceRepository(BrokerDbContext dbContext)
    : TransactionalRepository(dbContext),
        IBalanceRepository
{
    public void AddBalanceHistory(BalanceHistory balanceHistory) =>
        DbContext.BalanceHistories.Add(balanceHistory);

    public async Task<Balance?> GetBalanceOfAccount(int accountId) =>
        await DbContext.Balances.Where(x => x.AccountId == accountId).FirstOrDefaultAsync();

    public void UpdateBalance(Balance balance) => DbContext.Balances.Update(balance);
}
