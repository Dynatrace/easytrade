using EasyTrade.BrokerService.ProblemPatterns.OpenFeature.Providers.FeatureFlagService;
using OpenFeature;
using OpenFeature.Model;

namespace EasyTrade.BrokerService.ProblemPatterns.OpenFeature.Providers;

public class PluginProvider(IFeatureFlagServiceConnector flagServiceConnector) : FeatureProvider
{
    public static string Name => "Plugin Provider";
    private readonly IFeatureFlagServiceConnector _flagServiceConnector = flagServiceConnector;

    public override Metadata GetMetadata() => new(Name);

    public override async Task<ResolutionDetails<bool>> ResolveBooleanValueAsync(
        string flagKey,
        bool defaultValue,
        EvaluationContext? context = null,
        CancellationToken cancellationToken = default
    )
    {
        var flag = await _flagServiceConnector.GetFlag(flagKey);
        var value = flag is null ? defaultValue : flag.Enabled;
        return new ResolutionDetails<bool>(flagKey, value);
    }

    public override Task<ResolutionDetails<double>> ResolveDoubleValueAsync(
        string flagKey,
        double defaultValue,
        EvaluationContext? context = null,
        CancellationToken cancellationToken = default
    ) => throw new NotImplementedException();

    public override Task<ResolutionDetails<int>> ResolveIntegerValueAsync(
        string flagKey,
        int defaultValue,
        EvaluationContext? context = null,
        CancellationToken cancellationToken = default
    ) => throw new NotImplementedException();

    public override Task<ResolutionDetails<string>> ResolveStringValueAsync(
        string flagKey,
        string defaultValue,
        EvaluationContext? context = null,
        CancellationToken cancellationToken = default
    ) => throw new NotImplementedException();

    public override Task<ResolutionDetails<Value>> ResolveStructureValueAsync(
        string flagKey,
        Value defaultValue,
        EvaluationContext? context = null,
        CancellationToken cancellationToken = default
    ) => throw new NotImplementedException();
}
