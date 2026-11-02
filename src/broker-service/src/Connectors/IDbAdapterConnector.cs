using Grpc.Net.Client;

namespace EasyTrade.BrokerService.Connectors;

public interface IDbAdapterConnector
{
    GrpcChannel GetChannel();
}
