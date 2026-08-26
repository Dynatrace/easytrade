using EasyTrade.BrokerService.Helpers;
using System.ComponentModel.DataAnnotations.Schema;

namespace EasyTrade.BrokerService.Entities.Balances;

[Table("Balancehistory")]
public class BalanceHistory(
    Guid accountId,
    decimal oldValue,
    decimal valueChange,
    string actionType,
    DateTimeOffset actionDate
)
{
    public Guid Id { get; set; }
    public Guid AccountId { get; set; } = accountId;
    public decimal OldValue { get; set; } = oldValue;
    public decimal ValueChange { get; set; } = valueChange;
    public string ActionType { get; set; } = actionType;
    public DateTimeOffset ActionDate { get; set; } = actionDate;

    public BalanceHistory(
        Guid accountId,
        decimal oldValue,
        decimal valueChange,
        ActionType actionType
    )
        : this(
            accountId,
            oldValue,
            valueChange,
            actionType.ToString().ToLower(),
            DateTimeOffset.Now
        )
    { }
}
