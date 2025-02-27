using System.Collections.Concurrent;
using Microsoft.Extensions.Options;

namespace EasyTrade.BrokerService.Helpers.Logging;

[ProviderAlias("CustomLogger")]
public sealed class CustomLoggerProvider : ILoggerProvider
{
    private readonly IDisposable? _onChangeToken;
    private CustomLoggerConfiguration _currentConfig;
    private readonly ConcurrentDictionary<string, CustomLogger> _loggers =
        new(StringComparer.OrdinalIgnoreCase);

    public CustomLoggerProvider(IOptionsMonitor<CustomLoggerConfiguration> config)
    {
        _currentConfig = config.CurrentValue;
        _onChangeToken = config.OnChange(updated => _currentConfig = updated);
    }

    public ILogger CreateLogger(string category) =>
        _loggers.GetOrAdd(category, name => new CustomLogger(name, GetCurrentConfig));

    private CustomLoggerConfiguration GetCurrentConfig() => _currentConfig;

    public void Dispose()
    {
        _loggers.Clear();
        _onChangeToken?.Dispose();
    }
}
