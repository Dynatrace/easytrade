using EasyTrade.BrokerService.Connectors;
using EasyTrade.BrokerService.Helpers;
using EasyTrade.BrokerService.ProblemPatterns.OpenFeature;

namespace EasyTrade.BrokerService.Entities.Trades.Repository;

public class TradeRepositoryWithDbNotResponding(
    IDbAdapterConnector connector,
    IPluginManager pluginManager
) : TradeRepository(connector)
{
    private readonly IPluginManager _pluginManager = pluginManager;

    public override async Task<Trade> CreateTradeAsync(Trade trade)
    {
        if (await _pluginManager.GetPluginState(Constants.DbNotResponding, false))
        {
            trade.Id = Constants.InvalidTradeId;
        }
        return await base.CreateTradeAsync(trade);
    }
}
