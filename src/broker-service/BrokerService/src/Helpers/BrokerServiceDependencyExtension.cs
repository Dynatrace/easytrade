using EasyTrade.BrokerService.Entities.Accounts.ServiceConnector;
using EasyTrade.BrokerService.Entities.Balances.Repository;
using EasyTrade.BrokerService.Entities.Balances.Service;
using EasyTrade.BrokerService.Entities.Instruments.Repository;
using EasyTrade.BrokerService.Entities.Instruments.Service;
using EasyTrade.BrokerService.Entities.Packages.Repository;
using EasyTrade.BrokerService.Entities.Prices.ServiceConnector;
using EasyTrade.BrokerService.Entities.Products.Repository;
using EasyTrade.BrokerService.Entities.Trades.Notification;
using EasyTrade.BrokerService.Entities.Trades.Repository;
using EasyTrade.BrokerService.Entities.Trades.Service;
using EasyTrade.BrokerService.ProblemPatterns.OpenFeature;
using EasyTrade.BrokerService.ProblemPatterns.OpenFeature.Providers;
using EasyTrade.BrokerService.ProblemPatterns.OpenFeature.Providers.FeatureFlagService;
using HostInitActions;
using OpenFeature;

namespace EasyTrade.BrokerService.Helpers;

// Extension for grouping Dependency Injection for this project
public static class BrokerServiceDependencyExtension
{
    public static IServiceCollection AddBrokerServiceDependencyGroup(
        this IServiceCollection services
    )
    {
        services
            .AddAccountDependency()
            .AddInstrumentDependency()
            .AddBalanceDependency()
            .AddPackageDependency()
            .AddPriceDependency()
            .AddProductDependency()
            .AddTradesDependency()
            .AddProblemPatternsDependency();
        return services;
    }

    private static IServiceCollection AddAccountDependency(this IServiceCollection services) =>
        services.AddTransient<IAccountServiceConnector, AccountServiceConnector>();

    private static IServiceCollection AddBalanceDependency(this IServiceCollection services) =>
        services
            .AddTransient<IBalanceRepository, BalanceRepository>()
            .AddTransient<IBalanceService, BalanceService>();

    private static IServiceCollection AddInstrumentDependency(this IServiceCollection services) =>
        services
            .AddTransient<IInstrumentRepository, InstrumentRepository>()
            .AddTransient<IInstrumentService, InstrumentService>();

    private static IServiceCollection AddPackageDependency(this IServiceCollection services) =>
        services.AddTransient<IPackageRepository, PackageRepository>();

    private static IServiceCollection AddPriceDependency(this IServiceCollection services) =>
        services.AddTransient<IPriceServiceConnector, PriceServiceConnector>();

    private static IServiceCollection AddProductDependency(this IServiceCollection services) =>
        services.AddTransient<IProductRepository, ProductRepository>();

    private static IServiceCollection AddTradesDependency(this IServiceCollection services) =>
        services
            .AddTransient<ITradeRepository, TradeRepositoryWithDbNotResponding>()
            .AddTransient<ITradeService, TradeService>()
            .AddTransient<ILongTradeService, LongTradeService>()
            .AddTransient<ITradeNotificationService, TradeNotificationService>();

    private static IServiceCollection AddProblemPatternsDependency(this IServiceCollection services)
    {
        services
            .AddSingleton<IPluginManager, PluginManager>()
            .AddSingleton<FeatureProvider, PluginProvider>()
            .AddSingleton<IFeatureFlagServiceConnector, FeatureFlagServiceConnector>();
        services
            .AddAsyncServiceInitialization()
            .AddInitAction<IPluginManager>(async (service) => await service.InitializeAsync());
        return services;
    }
}
