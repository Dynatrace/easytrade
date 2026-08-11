using EasyTrade.BrokerService.Entities.Trades.Service;

namespace EasyTrade.BrokerService.Entities.Trades.Scheduler;

public class LongTradeSchedulerService(
    IServiceScopeFactory scopeFactory,
    ILogger<LongTradeSchedulerService> logger
) : BackgroundService
{
    private static readonly TimeSpan Rate = TimeSpan.FromMinutes(1);

    private readonly IServiceScopeFactory _scopeFactory = scopeFactory;
    private readonly ILogger _logger = logger;

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation(
            "Starting longrunningtransaction scheduler with a rate of {rate}s.",
            Rate.TotalSeconds
        );
        return RunLoop(stoppingToken);
    }

    private async Task RunLoop(CancellationToken token)
    {
        try
        {
            using var timer = new PeriodicTimer(Rate);
            while (true)
            {
                await RunTick();
                await timer.WaitForNextTickAsync(token);
            }
        }
        catch (OperationCanceledException) { }
    }

    private async Task RunTick()
    {
        _logger.LogInformation(
            "{timestamp}: Running tradeLogic. Invoking the service",
            DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        );

        try
        {
            using var scope = _scopeFactory.CreateScope();
            var longTradeService = scope.ServiceProvider.GetRequiredService<ILongTradeService>();
            await longTradeService.ProcessLongRunningTransactions();

            _logger.LogInformation(
                "{timestamp}: TradeLogic finished.",
                DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            );
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogError(
                "{timestamp}: Error running tradeLogic ({exception})",
                DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                exception.ToString()
            );
        }
    }
}
