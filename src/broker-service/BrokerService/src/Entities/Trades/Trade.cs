using EasyTrade.BrokerService.Helpers;

namespace EasyTrade.BrokerService.Entities.Trades;

public class Trade(
    Guid accountId,
    Guid instrumentId,
    string direction,
    decimal quantity,
    decimal entryPrice,
    DateTimeOffset timestampOpen,
    DateTimeOffset? timestampClose,
    bool tradeClosed,
    bool transactionHappened,
    string status
)
{
    public Guid Id { get; set; }
    public Guid AccountId { get; set; } = accountId;
    public Guid InstrumentId { get; set; } = instrumentId;
    public string Direction { get; set; } = direction;
    public decimal Quantity { get; set; } = quantity;
    public decimal EntryPrice { get; set; } = entryPrice;
    public DateTimeOffset TimestampOpen { get; set; } = timestampOpen;
    public DateTimeOffset? TimestampClose { get; set; } = timestampClose;
    public bool TradeClosed { get; set; } = tradeClosed;
    public bool TransactionHappened { get; set; } = transactionHappened;
    public string Status { get; set; } = status;

    public Trade(
        Guid id,
        Guid accountId,
        Guid instrumentId,
        string direction,
        decimal quantity,
        decimal entryPrice,
        DateTimeOffset timestampOpen,
        DateTimeOffset? timestampClose,
        bool tradeClosed,
        bool transactionHappened,
        string status
    )
        : this(
            accountId,
            instrumentId,
            direction,
            quantity,
            entryPrice,
            timestampOpen,
            timestampClose,
            tradeClosed,
            transactionHappened,
            status
        ) => Id = id;

    public static Trade QuickTrade(
        Guid accountId,
        Guid instrumentId,
        ActionType direction,
        decimal price,
        decimal quantity
    ) =>
        new(
            accountId,
            instrumentId,
            direction.ToString().ToLower(),
            quantity,
            price,
            DateTimeOffset.Now,
            DateTimeOffset.Now,
            true,
            true,
            "Instant " + direction.ToString() + " done."
        );

    public static Trade LongTrade(
        Guid accountId,
        Guid instrumentId,
        ActionType direction,
        decimal price,
        decimal quantity,
        int duration
    ) =>
        new(
            accountId,
            instrumentId,
            direction.ToString().ToLower(),
            quantity,
            price,
            DateTimeOffset.Now,
            DateTimeOffset.Now.AddHours(duration),
            false,
            false,
            direction.ToString() + " registered."
        );
}
