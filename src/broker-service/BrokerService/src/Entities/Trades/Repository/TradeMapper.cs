using EasyTrade.DbAdapter.Trade.Grpc;
using Google.Protobuf.WellKnownTypes;

namespace EasyTrade.BrokerService.Entities.Trades.Repository;

public static class TradeMapper
{
    private static Timestamp? ToNullableTimestamp(DateTimeOffset? value) =>
        value.HasValue ? Timestamp.FromDateTimeOffset(value.Value) : null;

    public static Trade FromProto(TradeMessage proto)
    {
        return new Trade(
            id: Guid.Parse(proto.Id),
            accountId: Guid.Parse(proto.AccountId),
            instrumentId: Guid.Parse(proto.InstrumentId),
            direction: proto.Direction,
            quantity: (decimal)proto.Quantity,
            entryPrice: (decimal)proto.EntryPrice,
            timestampOpen: proto.TimestampOpen.ToDateTimeOffset(),
            timestampClose: proto.TimestampClose?.ToDateTimeOffset(),
            tradeClosed: proto.TradeClosed,
            transactionHappened: proto.TransactionHappened,
            status: proto.Status
        );
    }

    public static CreateTradeRequest CreateToProto(Trade trade)
    {
        return new CreateTradeRequest
        {
            AccountId = trade.AccountId.ToString(),
            InstrumentId = trade.InstrumentId.ToString(),
            Direction = trade.Direction,
            Quantity = (double)trade.Quantity,
            EntryPrice = (double)trade.EntryPrice,
            TimestampOpen = Timestamp.FromDateTimeOffset(trade.TimestampOpen),
            TimestampClose = ToNullableTimestamp(trade.TimestampClose),
            TradeClosed = trade.TradeClosed,
            TransactionHappened = trade.TransactionHappened,
            Status = trade.Status
        };
    }

    public static UpdateTradeRequest UpdateToProto(Trade trade)
    {
        return new UpdateTradeRequest
        {
            Id = trade.Id.ToString(),
            TradeClosed = trade.TradeClosed,
            TimestampClose = ToNullableTimestamp(trade.TimestampClose),
            Status = trade.Status
        };
    }

    public static List<Trade> FromProto(IEnumerable<TradeMessage> protos) => [.. protos.Select(FromProto)];
}
