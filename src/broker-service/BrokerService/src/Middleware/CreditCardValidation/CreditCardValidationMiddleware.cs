using System.Text.Json;
using EasyTrade.BrokerService.ExceptionHandling;
using EasyTrade.BrokerService.Helpers;
using EasyTrade.BrokerService.ProblemPatterns.OpenFeature;

namespace EasyTrade.BrokerService.Middleware.CreditCardValidation;

public class CreditCardValidationMiddleware(
    IPluginManager pluginManager,
    IMainframeServiceConnector mainframeConnector,
    ILogger<CreditCardValidationMiddleware> logger
) : IMiddleware
{
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        var flagEnabled = await pluginManager.GetPluginState(
            Constants.CreditCardValidation,
            false
        );

        if (!flagEnabled)
        {
            await next(context);
            return;
        }

        if (!IsBalanceRequest(context.Request))
        {
            await next(context);
            return;
        }

        var cardNumber = await ExtractCardNumberAsync(context.Request);
        if (string.IsNullOrEmpty(cardNumber))
        {
            logger.LogWarning(
                "[CreditCardValidation] Card number not found in request body — failing open"
            );
            await next(context);
            return;
        }

        var isValid = await mainframeConnector.ValidateCreditCardAsync(cardNumber);
        if (!isValid)
        {
            logger.LogWarning("[CreditCardValidation] Card validation failed — rejecting request");
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            context.Response.ContentType = "application/json";
            var error = new ErrorResponse(
                StatusCodes.Status400BadRequest,
                "Credit card validation failed"
            );
            await context.Response.WriteAsync(JsonSerializer.Serialize(error));
            return;
        }

        await next(context);
    }

    private static bool IsBalanceRequest(HttpRequest request)
    {
        if (!HttpMethods.IsPost(request.Method))
            return false;

        var path = request.Path.Value ?? string.Empty;
        // Matches /v1/balance/{accountId}/deposit and /v1/balance/{accountId}/withdraw
        return path.StartsWith("/v1/balance/", StringComparison.OrdinalIgnoreCase)
            && (
                path.EndsWith("/deposit", StringComparison.OrdinalIgnoreCase)
                || path.EndsWith("/withdraw", StringComparison.OrdinalIgnoreCase)
            );
    }

    private static async Task<string?> ExtractCardNumberAsync(HttpRequest request)
    {
        request.EnableBuffering();
        var dto = await request.ReadFromJsonAsync<CardNumberOnly>();
        request.Body.Seek(0, SeekOrigin.Begin);
        return dto?.CardNumber;
    }

    private record CardNumberOnly(string? CardNumber);
}
