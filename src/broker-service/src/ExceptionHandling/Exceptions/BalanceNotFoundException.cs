namespace EasyTrade.BrokerService.ExceptionHandling.Exceptions;

public class BalanceNotFoundException : Exception
{
    public BalanceNotFoundException(string message)
        : base(message) { }

    public BalanceNotFoundException()
        : base() { }

    public BalanceNotFoundException(string? message, System.Exception? innerException)
        : base(message, innerException) { }

    public BalanceNotFoundException(Guid accountId)
        : this($"Balance for account {accountId} not found") { }
}
