namespace EasyTrade.BrokerService.Entities.Trades.DTO;

public class QuickTradeDTO(Guid accountId, Guid instrumentId, decimal amount)
{
    public Guid AccountId { get; set; } = accountId;
    public Guid InstrumentId { get; set; } = instrumentId;
    public decimal Amount { get; set; } = amount;
}
