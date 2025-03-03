namespace EasyTrade.BrokerService.Entities.Trades.DTO;

public class LongTradeDTO(
    int accountId,
    int instrumentId,
    decimal amount,
    int duration,
    decimal price
) : QuickTradeDTO(accountId, instrumentId, amount)
{
    public int Duration { get; set; } = duration;
    public decimal Price { get; set; } = price;
}
