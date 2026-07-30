using EasyTrade.DbAdapter.Balance.Grpc;
using EasyTrade.DbAdapter.Common.Grpc;
using Google.Protobuf.WellKnownTypes;

namespace EasyTrade.BrokerService.Entities.Balances.Repository;

public static class BalanceMapper
{
    public static Balance FromProto(BalanceMessage grpcBalance)
    {
        return new Balance(Guid.Parse(grpcBalance.AccountId), (decimal)grpcBalance.Value);
    }

    public static BalanceHistory FromProto(BalanceHistoryMessage proto)
    {
        return new BalanceHistory(
            Guid.Parse(proto.AccountId),
            (decimal)proto.OldValue,
            (decimal)proto.ValueChange,
            proto.ActionType,
            proto.ActionDate.ToDateTimeOffset()
        )
        {
            Id = Guid.Parse(proto.Id)
        };
    }

    public static UpdateBalanceRequest ToProto(Balance balance)
    {
        return new UpdateBalanceRequest
        {
            AccountId = balance.AccountId.ToString(),
            Value = (double)balance.Value
        };
    }

    public static AddBalanceHistoryRequest ToProto(BalanceHistory history)
    {
        return new AddBalanceHistoryRequest
        {
            AccountId = history.AccountId.ToString(),
            OldValue = (double)history.OldValue,
            ValueChange = (double)history.ValueChange,
            ActionType = history.ActionType,
            ActionDate = Timestamp.FromDateTimeOffset(history.ActionDate)
        };
    }
}
