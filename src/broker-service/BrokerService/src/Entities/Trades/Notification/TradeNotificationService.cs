namespace EasyTrade.BrokerService.Entities.Trades.Notification;

public class TradeNotificationService(ILogger<TradeNotificationService> logger)
    : ITradeNotificationService
{
    private readonly ILogger _logger = logger;

    public void OnTradeClosed(Trade trade)
    {
        _logger.LogInformation(
            "Trade with ID [{id}] was closed, transaction happened [{transactionHappened}], status [{status}]",
            trade.Id,
            trade.TransactionHappened,
            trade.Status
        );
    }
}
