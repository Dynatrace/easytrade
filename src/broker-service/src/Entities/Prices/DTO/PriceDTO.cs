namespace EasyTrade.BrokerService.Entities.Prices.DTO;

public class PriceDTO(
    DateTimeOffset timestamp,
    decimal open,
    decimal close,
    decimal low,
    decimal high
)
{
    public DateTimeOffset Timestamp { get; set; } = timestamp;
    public decimal Open { get; set; } = open;
    public decimal Close { get; set; } = close;
    public decimal Low { get; set; } = low;
    public decimal High { get; set; } = high;

    public PriceDTO(Price price)
        : this(price.Timestamp, price.Open, price.Close, price.Low, price.High) { }
}
