using EasyTrade.BrokerService.Entities.Trades;
using EasyTrade.BrokerService.Entities.Trades.Notification;

namespace EasyTrade.BrokerService.Test.Fakes;

public class FakeNotificationService : ITradeNotificationService
{
    public void OnTradeClosed(Trade trade) { }
}
