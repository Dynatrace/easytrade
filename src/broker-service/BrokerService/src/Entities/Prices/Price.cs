namespace EasyTrade.BrokerService.Entities.Prices;

public class Price(
    int instrumentId,
    DateTimeOffset timestamp,
    decimal open,
    decimal high,
    decimal low,
    decimal close
)
{
    public int Id { get; set; }
    public int InstrumentId { get; set; } = instrumentId;
    public DateTimeOffset Timestamp { get; set; } = timestamp;
    public decimal Open { get; set; } = open;
    public decimal High { get; set; } = high;
    public decimal Low { get; set; } = low;
    public decimal Close { get; set; } = close;
}
