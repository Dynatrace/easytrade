namespace EasyTrade.BrokerService.Entities.Balances.Repository;

public interface IBalanceRepository
{
    Task<Balance?> GetBalanceOfAccountAsync(Guid accountId);
    Task<BalanceHistory> AddBalanceHistoryAsync(BalanceHistory balanceHistory);
    Task<Balance> UpdateBalanceAsync(Balance balance);
}
