namespace EasyTrade.BrokerService.ExceptionHandling.Exceptions;

public class InstrumentNotFoundException : Exception
{
    public InstrumentNotFoundException(string message)
        : base(message) { }

    public InstrumentNotFoundException()
        : base() { }

    public InstrumentNotFoundException(string? message, System.Exception? innerException)
        : base(message, innerException) { }

    public InstrumentNotFoundException(int id)
        : this($"Instrument with id {id} doesn't exist") { }
}
