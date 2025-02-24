using System.Runtime.CompilerServices;
using EasyTrade.BrokerService.Helpers;
using EasyTrade.BrokerService.ProblemPatterns.OpenFeature;

namespace EasyTrade.BrokerService.ProblemPatterns.HighCpuUsage;

public class HighCpuUsageMiddleware(
    IPluginManager pluginManager,
    IConfiguration config,
    ILogger<HighCpuUsageMiddleware> logger
) : IMiddleware
{
    private readonly Random _random = new();
    private readonly int _delayMs = int.TryParse(
        config[Constants.HighCpuUsageRequestDelayMs],
        out var d
    )
        ? d
        : 700;

    private readonly int _concurrency = int.TryParse(
        config[Constants.HighCpuUsageConcurrency],
        out var d
    )
        ? d
        : 4;

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        var highCpuEnabled = await pluginManager.GetPluginState(Constants.HighCpuUsage, false);
        if (highCpuEnabled)
        {
            logger.LogWarning("Experimental feature flag enabled!");

            logger.LogDebug(
                "[HighCpuUsage] problem enabled, adding extra [{}ms] wait to request",
                _delayMs
            );
            var end = DateTime.Now.Add(TimeSpan.FromMilliseconds(_delayMs));

            List<Task> tasks = new();
            for (int i = 0; i < _concurrency; i++)
            {
                tasks.Add(Task.Run(() => NotMiningBitcoinLoop(end)));
            }
            await Task.WhenAll(tasks);
        }
        await next(context);
    }

    [MethodImpl(MethodImplOptions.NoInlining)] // Inlining has to be disabled for this method to be shown in the call hierarchy
    public void NotMiningBitcoin(long number)
    {
        // it is in fact not mining bitcoin
        // it's doing the collatz thing
        // and we will never know if it solves it by accident as nothing is logged
        while (number != 1)
        {
            number = number % 2 == 0 ? number / 2 : number * 3 + 1;
        }
    }

    [MethodImpl(MethodImplOptions.NoInlining)] // Inlining has to be disabled for this method to be shown in the call hierarchy
    public void NotMiningBitcoinLoop(DateTime end)
    {
        while (DateTime.Now < end)
        {
            var number = _random.Next(100_000, 1_000_000);
            NotMiningBitcoin(number);
        }
    }
}
