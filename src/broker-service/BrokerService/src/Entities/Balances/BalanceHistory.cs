using System.ComponentModel.DataAnnotations.Schema;
using EasyTrade.BrokerService.Helpers;

namespace EasyTrade.BrokerService.Entities.Balances;

[Table("Balancehistory")]
public class BalanceHistory(
    int accountId,
    decimal oldValue,
    decimal valueChange,
    string actionType,
    DateTimeOffset actionDate
)
{
    public int Id { get; set; }
    public int AccountId { get; set; } = accountId;
    public decimal OldValue { get; set; } = oldValue;
    public decimal ValueChange { get; set; } = valueChange;
    public string ActionType { get; set; } = actionType;
    public DateTimeOffset ActionDate { get; set; } = actionDate;

    public BalanceHistory(
        int accountId,
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
        ) { }
}
