namespace EasyTrade.BrokerService.ExceptionHandling;

public class ErrorResponse
{
    public int StatusCode { get; set; }
    public string Message { get; set; }

    public ErrorResponse(int statusCode, string message) =>
        (StatusCode, Message) = (statusCode, message);
}
