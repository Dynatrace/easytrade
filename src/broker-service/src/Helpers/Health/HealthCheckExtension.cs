using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace EasyTrade.BrokerService.Helpers.Health;

public static class HealthCheckExtension
{
    public static IServiceCollection AddBrokerServiceHealthChecks(this IServiceCollection services)
    {
        services.AddHealthChecks().AddCheck<DbAdapterHealthCheck>("db-adapter");
        return services;
    }

    public static WebApplication MapBrokerServiceHealthChecks(this WebApplication app)
    {
        app.MapHealthChecks("/livez", new HealthCheckOptions { Predicate = _ => false, ResponseWriter = WriteResponse });
        app.MapHealthChecks("/readyz", new HealthCheckOptions { ResponseWriter = WriteResponse });
        return app;
    }

    private static Task WriteResponse(HttpContext context, HealthReport report)
    {
        context.Response.ContentType = "text/plain";
        return context.Response.WriteAsync(report.Status == HealthStatus.Healthy ? "OK" : "Service Unavailable");
    }
}
