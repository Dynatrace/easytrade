using System.Net;
using EasyTrade.BrokerService.Entities.Prices.DTO;
using EasyTrade.BrokerService.Helpers;

namespace EasyTrade.BrokerService.Entities.Prices.ServiceConnector;

public class PriceServiceConnector(
    IConfiguration configuration,
    IHttpClientFactory httpClientFactory,
    ILogger<PriceServiceConnector> logger
) : IPriceServiceConnector
{
    private readonly IConfiguration _configuration = configuration;
    private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;
    private readonly ILogger _logger = logger;

    private string PriceServiceUrl => $"http://{_configuration[Constants.PricingService]}/";

    public async Task<IEnumerable<Price>> GetPricesByInstrumentId(Guid id, int count = 10)
    {
        _logger.LogInformation(
            "Fetching prices with instrument ID [{id}], count [{count}]",
            id,
            count
        );

        var endpoint = $"v1/prices/instrument/{id}?records={count}";
        using var client = GetHttpClient();
        using var response = await client.GetAsync(endpoint);
        if (response.StatusCode == HttpStatusCode.OK)
        {
            var pricesResult = await response.Content.ReadFromJsonAsync<PricesResultDto>();
            var prices = pricesResult?.Results ?? [];
            _logger.LogDebug("Fetched prices: {content}", prices.ToJson());
            return prices;
        }
        _logger.LogError("Fetch failed with status code [{statusCode}]", response.StatusCode);
        return Array.Empty<Price>();
    }

    public async Task<IEnumerable<Price>> GetLatestPrices()
    {
        _logger.LogInformation("Fetching latest prices");

        const string endpoint = "v1/prices/latest";
        using var client = GetHttpClient();
        using var response = await client.GetAsync(endpoint);
        if (response.StatusCode == HttpStatusCode.OK)
        {
            var pricesResult = await response.Content.ReadFromJsonAsync<PricesResultDto>();
            var prices = pricesResult?.Results ?? [];
            _logger.LogDebug("Fetched prices: {content}", prices.ToJson());
            return prices;
        }
        _logger.LogError("Fetch failed with status code [{statusCode}]", response.StatusCode);
        return Array.Empty<Price>();
    }

    public async Task<Price?> GetLastPriceByInstrumentId(Guid id)
    {
        _logger.LogInformation(
            "Fetching last price with instrument ID [{id}]",
            id
        );

        var endpoint = $"v1/prices/last?instrumentId={id}";
        using var client = GetHttpClient();
        using var response = await client.GetAsync(endpoint);
        if (response.StatusCode == HttpStatusCode.OK)
        {
            var price = await response.Content.ReadFromJsonAsync<Price>();
            _logger.LogDebug("Fetched price: {content}", price?.ToJson());
            return price;
        }
        _logger.LogError("Fetch failed with status code [{statusCode}]", response.StatusCode);
        return null;
    }

    private HttpClient GetHttpClient()
    {
        var client = _httpClientFactory.CreateClient();
        client.BaseAddress = new Uri(PriceServiceUrl);
        return client;
    }
}
