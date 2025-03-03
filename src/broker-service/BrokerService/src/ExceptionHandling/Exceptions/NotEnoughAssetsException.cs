namespace EasyTrade.BrokerService.ExceptionHandling.Exceptions;

public class NotEnoughAssetsException : Exception
{
    public NotEnoughAssetsException(string? message)
        : base(message) { }

    public NotEnoughAssetsException(string? message, System.Exception? innerException)
        : base(message, innerException) { }

    public NotEnoughAssetsException()
        : this("Not enough assets available!") { }
}
