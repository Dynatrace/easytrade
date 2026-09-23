namespace EasyTrade.BrokerService.ExceptionHandling.Exceptions;

public class NotEnoughMoneyException : Exception
{
    public NotEnoughMoneyException(string? message)
        : base(message) { }

    public NotEnoughMoneyException(string? message, System.Exception? innerException)
        : base(message, innerException) { }

    public NotEnoughMoneyException()
        : this("Not enough money available!") { }
}
