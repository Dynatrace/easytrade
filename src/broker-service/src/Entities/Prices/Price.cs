namespace EasyTrade.BrokerService.Entities.Prices;

public class Price(
    Guid instrumentId,
    DateTimeOffset timestamp,
    decimal open,
    decimal high,
    decimal low,
    decimal close
)
{
    public Guid Id { get; set; }
    public Guid InstrumentId { get; set; } = instrumentId;
    public DateTimeOffset Timestamp { get; set; } = timestamp;
    public decimal Open { get; set; } = open;
    public decimal High { get; set; } = high;
    public decimal Low { get; set; } = low;
    public decimal Close { get; set; } = close;
}
