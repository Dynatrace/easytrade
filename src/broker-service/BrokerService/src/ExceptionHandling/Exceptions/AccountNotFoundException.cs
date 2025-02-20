namespace EasyTrade.BrokerService.ExceptionHandling.Exceptions;

public class AccountNotFoundException : Exception
{
    public AccountNotFoundException(string message)
        : base(message) { }

    public AccountNotFoundException()
        : base() { }

    public AccountNotFoundException(string? message, System.Exception? innerException)
        : base(message, innerException) { }

    public AccountNotFoundException(int id)
        : this($"Account with id {id} doesn't exist") { }
}
