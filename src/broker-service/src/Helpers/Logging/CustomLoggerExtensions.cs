using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging.Configuration;

namespace EasyTrade.BrokerService.Helpers.Logging;

public static class CustomLoggerExtensions
{
    public static ILoggingBuilder AddCustomLogger(this ILoggingBuilder builder)
    {
        builder.AddConfiguration();

        builder.Services.TryAddEnumerable(
            ServiceDescriptor.Singleton<ILoggerProvider, CustomLoggerProvider>()
        );

        LoggerProviderOptions.RegisterProviderOptions<
            CustomLoggerConfiguration,
            CustomLoggerProvider
        >(builder.Services);

        return builder;
    }

    public static ILoggingBuilder AddCustomLogger(
        this ILoggingBuilder builder,
        Action<CustomLoggerConfiguration> configuration
    )
    {
        builder.AddCustomLogger();
        builder.Services.Configure(configuration);

        return builder;
    }
}
