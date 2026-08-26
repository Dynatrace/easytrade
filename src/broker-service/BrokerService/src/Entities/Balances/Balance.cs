using EasyTrade.BrokerService.ExceptionHandling.Exceptions;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EasyTrade.BrokerService.Entities.Balances;

[Table("Balance")]
public class Balance(Guid accountId, decimal value)
{
    [Key]
    public Guid AccountId { get; set; } = accountId;
    public decimal Value { get; set; } = value;

    public void Deposit(decimal amount)
    {
        if (amount < 0)
        {
            throw new NegativeAmountException();
        }
        Value += amount;
    }

    public void Withdraw(decimal amount)
    {
        if (amount < 0)
        {
            throw new NegativeAmountException();
        }
        else if (amount > Value)
        {
            throw new NotEnoughMoneyException(
                $"Not enought money to withdraw (missing {amount - Value})"
            );
        }
        Value -= amount;
    }
}
