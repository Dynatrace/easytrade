using EasyTrade.BrokerService.ExceptionHandling.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace EasyTrade.BrokerService.ExceptionHandling;

public class BrokerExceptionFilter(ILogger<BrokerExceptionFilter> logger) : IExceptionFilter
{
    private readonly ILogger _logger = logger;

    public void OnException(ExceptionContext context)
    {
        UpdateContext(context, GetStatusCode(context.Exception));
    }

    private static int GetStatusCode(Exception exception) =>
        exception switch
        {
            AccountNotFoundException
            or InstrumentNotFoundException
                => StatusCodes.Status404NotFound,
            NotEnoughMoneyException
            or NotEnoughAssetsException
            or NegativeAmountException
                => StatusCodes.Status400BadRequest,
            DbException => StatusCodes.Status503ServiceUnavailable,
            _ => StatusCodes.Status500InternalServerError,
        };

    private void UpdateContext(ExceptionContext context, int statusCode)
    {
        var typeName = context.Exception.GetType().ToString();
        var message = context.Exception.Message;

        if (statusCode == StatusCodes.Status500InternalServerError)
        {
            _logger.LogError("Exception not handled: ({type}: {message})", typeName, message);
            return;
        }

        var response = new ErrorResponse(statusCode, context.Exception.Message);
        context.Result = new ObjectResult(response) { StatusCode = statusCode };
        context.ExceptionHandled = true;

        _logger.LogInformation(
            "Exception handled with status [{status}]: ({type}: {message})",
            statusCode,
            typeName.Split('.').Last(),
            message
        );
    }
}
