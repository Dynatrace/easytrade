namespace EasyTrade.BrokerService.Entities.Trades.DTO;

public class QuickTradeDTO(int accountId, int instrumentId, decimal amount)
{
    public int AccountId { get; set; } = accountId;
    public int InstrumentId { get; set; } = instrumentId;
    public decimal Amount { get; set; } = amount;
}
