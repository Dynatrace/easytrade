using System.ComponentModel.DataAnnotations.Schema;

namespace EasyTrade.BrokerService.Entities.Instruments;

[Table("Ownedinstruments")]
public class OwnedInstrument(
    Guid accountId,
    Guid instrumentId,
    decimal quantity,
    DateTimeOffset lastModificationDate
)
{
    public Guid Id { get; set; }
    public Guid AccountId { get; set; } = accountId;
    public Guid InstrumentId { get; set; } = instrumentId;
    public decimal Quantity { get; set; } = quantity;
    public DateTimeOffset LastModificationDate { get; set; } = lastModificationDate;

    public OwnedInstrument(Guid accountId, Guid instrumentId, decimal quantity)
        : this(accountId, instrumentId, quantity, DateTimeOffset.Now) { }
}
