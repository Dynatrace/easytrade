namespace EasyTrade.BrokerService.ExceptionHandling.Exceptions;

public class PriceNotFoundException : Exception
{
    public PriceNotFoundException(string message)
        : base(message) { }

    public PriceNotFoundException()
        : base() { }

    public PriceNotFoundException(string? message, System.Exception? innerException)
        : base(message, innerException) { }

    public PriceNotFoundException(Guid instrumentId)
        : this($"No price found for instrument {instrumentId}") { }
}
