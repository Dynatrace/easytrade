using EasyTrade.BrokerService.Connectors;
using EasyTrade.BrokerService.Helpers;
using EasyTrade.DbAdapter.Balance.Grpc;

namespace EasyTrade.BrokerService.Entities.Balances.Repository;

public class BalanceRepository(IDbAdapterConnector connector)
    : DbAdapterRepository<BalanceService.BalanceServiceClient>(connector, channel => new(channel)), IBalanceRepository
{
    public async Task<Balance?> GetBalanceOfAccountAsync(Guid accountId) =>
        await GrpcHelper.ExecuteAsync(
            async () => BalanceMapper.FromProto(await GetClient().GetBalanceByAccountIdAsync(new GetBalanceRequest { AccountId = accountId.ToString() }))
        );

    public async Task<Balance> UpdateBalanceAsync(Balance balance) =>
        await GrpcHelper.ExecuteAsync(
            async () => BalanceMapper.FromProto(await GetClient().UpdateBalanceAsync(BalanceMapper.ToProto(balance)))
        );

    public async Task<BalanceHistory> AddBalanceHistoryAsync(BalanceHistory balanceHistory) =>
        await GrpcHelper.ExecuteAsync(
            async () => BalanceMapper.FromProto(await GetClient().AddBalanceHistoryAsync(BalanceMapper.ToProto(balanceHistory)))
        );
}
