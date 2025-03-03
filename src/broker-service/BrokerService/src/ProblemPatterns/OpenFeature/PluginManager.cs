using System.Collections.Concurrent;
using EasyTrade.BrokerService.Helpers;
using OpenFeature;

namespace EasyTrade.BrokerService.ProblemPatterns.OpenFeature;

public class PluginManager(FeatureProvider provider, IConfiguration config) : IPluginManager
{
    private readonly Api _openFeature = Api.Instance;
    private bool _initialized = false;
    private readonly ConcurrentDictionary<string, Tuple<bool, DateTime>> _cache = [];
    private readonly int _cacheDurationS = int.TryParse(
        config[Constants.FeatureFlagCacheDurationS],
        out var d
    )
        ? d
        : 60;

    public async Task<bool> GetPluginState(string pluginName, bool defaultValue)
    {
        var now = DateTime.UtcNow;
        if (_cache.TryGetValue(pluginName, out var cached) && cached.Item2 > now)
        {
            return cached.Item1;
        }
        var value = await _openFeature.GetClient().GetBooleanValueAsync(pluginName, defaultValue);
        _cache[pluginName] = new(value, now.Add(TimeSpan.FromSeconds(_cacheDurationS)));
        return value;
    }

    public async Task InitializeAsync()
    {
        if (!_initialized)
        {
            await _openFeature.SetProviderAsync(provider);
            _initialized = true;
        }
    }
}
