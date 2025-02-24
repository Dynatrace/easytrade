namespace EasyTrade.BrokerService.ProblemPatterns.OpenFeature.Providers.FeatureFlagService;

public interface IFeatureFlagServiceConnector
{
    public Task<Flag?> GetFlag(string id);
}
