using Grpc.Core;

namespace EasyTrade.BrokerService.Connectors;

public abstract class DbAdapterRepository<TClient>(IDbAdapterConnector connector, Func<ChannelBase, TClient> factory)
{
    private readonly Lazy<TClient> _client = new(() => factory(connector.GetChannel()));
    protected TClient GetClient() => _client.Value;
}
