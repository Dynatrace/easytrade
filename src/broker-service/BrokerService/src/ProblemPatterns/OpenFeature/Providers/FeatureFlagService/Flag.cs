namespace EasyTrade.BrokerService.ProblemPatterns.OpenFeature.Providers.FeatureFlagService;

public record Flag(
    string Id,
    bool Enabled,
    string Name,
    string Description,
    bool IsModifiable,
    string Tag
) { }
