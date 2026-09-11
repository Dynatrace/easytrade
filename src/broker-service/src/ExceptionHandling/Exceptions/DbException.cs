namespace EasyTrade.BrokerService.ExceptionHandling.Exceptions;

public class DbException : Exception
{
    public DbException(string message)
        : base(message) { }

    public DbException()
        : base("Database error") { }

    public DbException(string? message, System.Exception? innerException)
        : base(message, innerException) { }
}
