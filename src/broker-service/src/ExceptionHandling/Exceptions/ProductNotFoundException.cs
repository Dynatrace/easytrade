namespace EasyTrade.BrokerService.ExceptionHandling.Exceptions;

public class ProductNotFoundException : Exception
{
    public ProductNotFoundException(string message)
        : base(message) { }

    public ProductNotFoundException()
        : base() { }

    public ProductNotFoundException(string? message, System.Exception? innerException)
        : base(message, innerException) { }

    public ProductNotFoundException(Guid id)
        : this($"Product with id {id} not found") { }
}
