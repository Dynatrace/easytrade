using EasyTrade.BrokerService.Entities.Prices.DTO;
using EasyTrade.BrokerService.Helpers;
using System.Net;

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
        var pricesResult = await FetchAsync<PricesResultDto>(endpoint);
        var prices = pricesResult?.Results ?? [];
        _logger.LogDebug("Fetched prices: {content}", prices.ToJson());
        return prices;
    }

    public async Task<IEnumerable<Price>> GetLatestPrices()
    {
        _logger.LogInformation("Fetching latest prices");

        const string endpoint = "v1/prices/latest";
        var pricesResult = await FetchAsync<PricesResultDto>(endpoint);
        var prices = pricesResult?.Results ?? [];
        _logger.LogDebug("Fetched prices: {content}", prices.ToJson());
        return prices;
    }

    public async Task<Price?> GetLastPriceByInstrumentId(Guid id)
    {
        _logger.LogInformation(
            "Fetching last price with instrument ID [{id}]",
            id
        );

        var endpoint = $"v1/prices/last?instrumentId={id}";
        var price = await FetchAsync<Price>(endpoint);
        _logger.LogDebug("Fetched price: {content}", price?.ToJson());
        return price;
    }

    public async Task<IReadOnlyDictionary<Guid, List<Price>>> GetPricesForInstrumentsAscByTimestamp(IEnumerable<Guid> instrumentIds, DateTimeOffset since)
    {
        var ids = instrumentIds.ToList();
        _logger.LogInformation(
            "Fetching prices for [{count}] instruments since [{since}]",
            ids.Count,
            since
        );

        if (ids.Count == 0)
        {
            return new Dictionary<Guid, List<Price>>();
        }

        const string endpoint = "v1/prices/instruments";
        var pricesResult = await PostAsync<PricesForInstrumentsRequestDto, PricesResultDto>(endpoint, new PricesForInstrumentsRequestDto(ids, since));
        var prices = pricesResult?.Results ?? [];
        _logger.LogDebug("Fetched prices: {content}", prices.ToJson());

        return prices.GroupBy(price => price.InstrumentId).ToDictionary(group => group.Key, group => group.ToList());
    }

    private async Task<TResponse?> FetchAsync<TResponse>(string endpoint)
    {
        using var client = GetHttpClient();
        using var response = await client.GetAsync(endpoint);
        return await ReadJsonOrLogError<TResponse>(response);
    }

    private async Task<TResponse?> PostAsync<TRequest, TResponse>(string endpoint, TRequest body)
    {
        using var client = GetHttpClient();
        using var response = await client.PostAsJsonAsync(endpoint, body);
        return await ReadJsonOrLogError<TResponse>(response);
    }

    private async Task<T?> ReadJsonOrLogError<T>(HttpResponseMessage response)
    {
        if (response.StatusCode == HttpStatusCode.OK)
        {
            return await response.Content.ReadFromJsonAsync<T>();
        }
        _logger.LogError("Fetch failed with status code [{statusCode}]", response.StatusCode);
        return default;
    }

    private HttpClient GetHttpClient()
    {
        var client = _httpClientFactory.CreateClient();
        client.BaseAddress = new Uri(PriceServiceUrl);
        return client;
    }
}
