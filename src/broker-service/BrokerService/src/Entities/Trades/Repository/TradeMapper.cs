using Google.Protobuf.WellKnownTypes;
using EasyTrade.DbAdapter.Trade.Grpc;

namespace EasyTrade.BrokerService.Entities.Trades.Repository;

public static class TradeMapper
{
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
            TimestampClose = trade.TimestampClose.HasValue 
                ? Timestamp.FromDateTimeOffset(trade.TimestampClose.Value)
                : null,
            Status = trade.Status
        };
    }

    public static List<Trade> FromProto(IEnumerable<TradeMessage> protos)
    {
        return [.. protos.Select(FromProto)];
    }
}
