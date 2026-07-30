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

    public override Task<Trade> CreateTradeAsync(Trade trade)
    {
        if (CheckIfProblemPatternIsOn())
        {
            trade.Id = Constants.InvalidTradeId;
        }
        return base.CreateTradeAsync(trade);
    }

    private bool CheckIfProblemPatternIsOn()
    {
        var task = Task.Run(
            async () => await _pluginManager.GetPluginState(Constants.DbNotResponding, false)
        );
        return task.Result;
    }
}
