using EasyTrade.BrokerService.Helpers;

namespace EasyTrade.BrokerService.Entities.Trades.Notification;

public class TradeNotificationService(
    IConfiguration configuration,
    IHttpClientFactory httpClientFactory,
    ILogger<TradeNotificationService> logger
) : ITradeNotificationService
{
    private readonly IConfiguration _configuration = configuration;
    private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;
    private readonly ILogger _logger = logger;

    public void OnTradeClosed(Trade trade)
    {
        Task.Run(() => NotifyEngineServiceOnTradeClosed(trade));
    }

    private async Task NotifyEngineServiceOnTradeClosed(Trade trade)
    {
        _logger.LogDebug("Notifying engine service about trade with ID [{id}]", trade.Id);

        var endpoint =
            $"http://{_configuration[Constants.EngineService]}/api/trade/scheduler/notification";
        using var client = _httpClientFactory.CreateClient();
        try
        {
            using var response = await client.PostAsJsonAsync(endpoint, trade);
            if (!response.IsSuccessStatusCode)
                throw new HttpRequestException(
                    $"Connection failed with status code [{response.StatusCode}]"
                );
        }
        catch (Exception exception)
        {
            _logger.LogError(
                "Error occured while trying to notify engine service ({exception})",
                exception.ToString()
            );
        }
    }
}
