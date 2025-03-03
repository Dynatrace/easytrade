namespace EasyTrade.BrokerService.Entities.Trades.DTO;

public class TradeDTO(Trade trade)
{
    public int InstrumentId { get; set; } = trade.InstrumentId;
    public string Direction { get; set; } = trade.Direction;
    public decimal Quantity { get; set; } = trade.Quantity;
    public decimal EntryPrice { get; set; } = trade.EntryPrice;
    public DateTimeOffset TimestampOpen { get; set; } = trade.TimestampOpen;
    public DateTimeOffset? TimestampClose { get; set; } = trade.TimestampClose;
    public bool TradeClosed { get; set; } = trade.TradeClosed;
    public bool TransactionHappened { get; set; } = trade.TransactionHappened;
    public string Status { get; set; } = trade.Status;
}
