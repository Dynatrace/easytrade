namespace EasyTrade.BrokerService.Entities.Trades.Scheduler;

public interface ILongTradeSchedulerService
{
    string Start();
    string Stop();
    string Status();
}
