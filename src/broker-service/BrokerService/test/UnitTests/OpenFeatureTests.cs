using EasyTrade.BrokerService.Helpers;
using EasyTrade.BrokerService.ProblemPatterns.OpenFeature;
using EasyTrade.BrokerService.ProblemPatterns.OpenFeature.Providers;
using EasyTrade.BrokerService.ProblemPatterns.OpenFeature.Providers.FeatureFlagService;
using EasyTrade.BrokerService.Test.Fakes;
using Microsoft.Extensions.Configuration;

namespace EasyTrade.BrokerService.Test.UnitTests;

public class OpenFeatureTests
{
    private FakeFeatureFlagServiceConnector? _flagServiceConnector;

    [Fact]
    public async Task GetFlag_WithUndefinedValue_ShouldReturnDefault()
    {
        // Arrange
        var pluginManager = await BuildPluginManager();
        const bool defaultValue = true;
        // Act
        var value = await pluginManager.GetPluginState(Constants.DbNotResponding, defaultValue);
        // Assert
        Assert.Equal(defaultValue, value);
    }

    [Fact]
    public async Task GetFlag_WithFalseValue_ShouldReturnFalse()
    {
        // Arrange
        var pluginManager = await BuildPluginManager();
        const bool defaultValue = true;
        SetFlag(false);
        // Act
        var value = await pluginManager.GetPluginState(Constants.DbNotResponding, defaultValue);
        // Assert
        Assert.False(value);
    }

    [Fact]
    public async Task GetFlag_WithTrueValue_ShouldReturnTrue()
    {
        // Arrange
        var pluginManager = await BuildPluginManager();
        const bool defaultValue = false;
        SetFlag(true);
        // Act
        var value = await pluginManager.GetPluginState(Constants.DbNotResponding, defaultValue);
        // Assert
        Assert.True(value);
    }

    private void SetFlag(bool enabled) =>
        _flagServiceConnector!.SetFlag(
            new Flag(Constants.DbNotResponding, enabled, "", "", true, "")
        );

    private async Task<IPluginManager> BuildPluginManager()
    {
        _flagServiceConnector = new();
        var manager = new PluginManager(
            new PluginProvider(_flagServiceConnector),
            new ConfigurationBuilder().Build()
        );
        await manager.InitializeAsync();
        return manager;
    }
}
