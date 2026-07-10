using EasyTrade.BrokerService.Entities.Trades.Service;

namespace EasyTrade.BrokerService.Entities.Trades.Scheduler;

public class LongTradeSchedulerService(
    IServiceScopeFactory scopeFactory,
    ILogger<LongTradeSchedulerService> logger
) : ILongTradeSchedulerService, IHostedService
{
    private static readonly TimeSpan Rate = TimeSpan.FromMinutes(1);

    private readonly IServiceScopeFactory _scopeFactory = scopeFactory;
    private readonly ILogger _logger = logger;
    private CancellationTokenSource? _cts;     
    private Task? _executingTask;

    public Task StartAsync(CancellationToken cancellationToken)
    {
        Start();
        return Task.CompletedTask;
    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        Stop();
        if (_executingTask is not null)
        {
            try
            {
                await _executingTask;
            }
            catch (OperationCanceledException) { }
        }
    }

    public string Start()
    {
        _logger.LogInformation(
            "Starting longrunningtransaction scheduler with a rate of {rate}s.",
            Rate.TotalSeconds
        );

        if (_cts is null)
        {
            _cts = new CancellationTokenSource();
            _executingTask = RunLoop(_cts.Token);

            const string message = "Longrunningtransaction scheduler started.";
            _logger.LogInformation(message);
            return message;
        }

        const string alreadyStartedMessage = "Longrunningtransaction scheduler was already started!";
        _logger.LogInformation(alreadyStartedMessage);
        return alreadyStartedMessage;
    }

    public string Stop()
    {
        _logger.LogInformation("Stopping longrunningtransaction scheduler.");

        if (_cts is not null)
        {
            _cts.Cancel();
            _cts.Dispose();
            _cts = null;

            const string message = "Longrunningtransaction scheduler stopped.";
            _logger.LogInformation(message);
            return message;
        }

        const string alreadyStoppedMessage = "Longrunningtransaction scheduler was already stopped!";
        _logger.LogInformation(alreadyStoppedMessage);
        return alreadyStoppedMessage;
    }

    public string Status() =>
        $"Longrunningtransaction scheduler is currently {(_cts is null ? "stopped" : "running")}.";

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
