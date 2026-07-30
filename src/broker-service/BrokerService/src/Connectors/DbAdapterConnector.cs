using EasyTrade.BrokerService.Helpers;
using Grpc.Net.Client;

namespace EasyTrade.BrokerService.Connectors;

public class DbAdapterConnector : IDbAdapterConnector
{
    private readonly GrpcChannel _channel;

     public DbAdapterConnector(IConfiguration configuration)
    {
        var hostAndPort = configuration[Constants.DbAdapterService] ?? throw new InvalidOperationException($"{Constants.DbAdapterService} is not configured.");
        _channel = GrpcChannel.ForAddress($"http://{hostAndPort}");
    }

    public GrpcChannel GetChannel()
    {
        return _channel;
    }
}
