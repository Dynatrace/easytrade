namespace EasyTrade.BrokerService.Entities.Trades.Notification;

public interface ITradeNotificationService
{
    public void OnTradeClosed(Trade trade);
}
