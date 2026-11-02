namespace EasyTrade.BrokerService.ExceptionHandling.Exceptions;

public class NegativeAmountException : Exception
{
    public NegativeAmountException(string? message)
        : base(message) { }

    public NegativeAmountException(string? message, System.Exception? innerException)
        : base(message, innerException) { }

    public NegativeAmountException()
        : this("Amount can't be lower that 0") { }
}
