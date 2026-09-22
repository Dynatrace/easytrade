namespace EasyTrade.BrokerService.Entities.Portfolio.DTO;

public class PortfolioPointDTO(DateTimeOffset timestamp, decimal totalValue)
{
    public DateTimeOffset Timestamp { get; set; } = timestamp;
    public decimal TotalValue { get; set; } = totalValue;
}
