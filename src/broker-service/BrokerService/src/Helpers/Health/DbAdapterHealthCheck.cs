using EasyTrade.BrokerService.Connectors;
using Grpc.Core;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace EasyTrade.BrokerService.Helpers.Health;

public class DbAdapterHealthCheck(IDbAdapterConnector connector) : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        var channel = connector.GetChannel();
        var state = channel.State;

        if (state == ConnectivityState.Idle)
        {
            _ = channel.ConnectAsync(cancellationToken: cancellationToken);
        }

        return Task.FromResult(state == ConnectivityState.Ready ? HealthCheckResult.Healthy() : HealthCheckResult.Unhealthy());
    }
}
