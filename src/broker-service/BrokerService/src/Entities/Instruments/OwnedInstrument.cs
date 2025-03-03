using System.ComponentModel.DataAnnotations.Schema;

namespace EasyTrade.BrokerService.Entities.Instruments;

[Table("Ownedinstruments")]
public class OwnedInstrument(
    int accountId,
    int instrumentId,
    decimal quantity,
    DateTimeOffset lastModificationDate
)
{
    public int Id { get; set; }
    public int AccountId { get; set; } = accountId;
    public int InstrumentId { get; set; } = instrumentId;
    public decimal Quantity { get; set; } = quantity;
    public DateTimeOffset LastModificationDate { get; set; } = lastModificationDate;

    public OwnedInstrument(int accountId, int instrumentId, decimal quantity)
        : this(accountId, instrumentId, quantity, DateTimeOffset.Now) { }
}
