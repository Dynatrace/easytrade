namespace EasyTrade.BrokerService.ProblemPatterns.OpenFeature;

public interface IPluginManager
{
    Task InitializeAsync();
    Task<bool> GetPluginState(string pluginName, bool defaultValue);
}
