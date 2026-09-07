using EasyTrade.BrokerService.Helpers;
using Grpc.Net.Client;

namespace EasyTrade.BrokerService.Connectors;

public class DbAdapterConnector : IDbAdapterConnector
{
    private readonly GrpcChannel _channel;

    public DbAdapterConnector(IConfiguration configuration)
    {
        var addr = configuration[Constants.DbAdapterAddress] ?? throw new InvalidOperationException($"{Constants.DbAdapterAddress} is not configured.");
        _channel = GrpcChannel.ForAddress($"http://{addr}");
    }

    public GrpcChannel GetChannel() => _channel;
}
