using System.Text;
using System.Text.Json;
using EasyTrade.BrokerService.Helpers;

namespace EasyTrade.BrokerService.Middleware.CreditCardValidation;

public class MainframeServiceConnector(
    IConfiguration config,
    ILogger<MainframeServiceConnector> logger
) : IMainframeServiceConnector
{
    private static readonly HttpClient _httpClient = new(
        new HttpClientHandler
        {
            ServerCertificateCustomValidationCallback =
                HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
        }
    );

    public async Task<bool> ValidateCreditCardAsync(string cardNumber)
    {
        var baseUrl = config[Constants.MainframeServiceUrl];
        if (string.IsNullOrEmpty(baseUrl))
        {
            logger.LogWarning(
                "[CreditCardValidation] {EnvVar} is not configured — failing open",
                Constants.MainframeServiceUrl
            );
            return true;
        }

        var url = $"{baseUrl}/zosConnect/services/creditcardCheck?action=invoke";
        var payload = JsonSerializer.Serialize(
            new { creditcardCheckOperation = new { INPUTDATA = cardNumber } }
        );
        var content = new StringContent(payload, Encoding.UTF8, "application/json");

        try
        {
            logger.LogDebug(
                "[CreditCardValidation] Validating card ending in {Last4} against mainframe",
                cardNumber.Length >= 4 ? cardNumber[^4..] : "****"
            );
            var response = await _httpClient.PostAsync(url, content);
            var isValid = response.IsSuccessStatusCode;
            logger.LogDebug(
                "[CreditCardValidation] Mainframe responded with {StatusCode} — card is {Result}",
                (int)response.StatusCode,
                isValid ? "valid" : "invalid"
            );
            return isValid;
        }
        catch (Exception ex)
        {
            logger.LogWarning(
                ex,
                "[CreditCardValidation] Mainframe request failed — failing open"
            );
            return true;
        }
    }
}
