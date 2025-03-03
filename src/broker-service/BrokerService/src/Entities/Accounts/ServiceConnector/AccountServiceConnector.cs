using System.Net;
using EasyTrade.BrokerService.ExceptionHandling.Exceptions;
using EasyTrade.BrokerService.Helpers;

namespace EasyTrade.BrokerService.Entities.Accounts.ServiceConnector;

public class AccountServiceConnector(
    IConfiguration configuration,
    IHttpClientFactory httpClientFactory,
    ILogger<AccountServiceConnector> logger
) : IAccountServiceConnector
{
    private readonly IConfiguration _configuration = configuration;
    private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;
    private readonly ILogger _logger = logger;

    private string AccountServiceUrl => $"http://{_configuration[Constants.AccountService]}/api/";

    public async Task<Account> GetAccountById(int id)
    {
        _logger.LogInformation("Fetching account with ID [{id}]", id);

        var endpoint = $"accounts/{id}";
        using var client = GetHttpClient();
        using var response = await client.GetAsync(endpoint);
        if (response.StatusCode == HttpStatusCode.OK)
        {
            var account = await response.Content.ReadFromJsonAsync<Account>();
            _logger.LogDebug("Fetched account: {account}", account!.ToJson());
            return account!;
        }
        throw new AccountNotFoundException($"Account with ID {id} was not found");
    }

    private HttpClient GetHttpClient()
    {
        var client = _httpClientFactory.CreateClient();
        client.BaseAddress = new Uri(AccountServiceUrl);
        return client;
    }
}
