using Grpc.Core;

namespace EasyTrade.BrokerService.Connectors;

public abstract class DbAdapterRepository<TClient>(IDbAdapterConnector connector, Func<ChannelBase, TClient> factory)
{
    private TClient? _client;
    protected TClient GetClient() => _client ??= factory(connector.GetChannel());
}
