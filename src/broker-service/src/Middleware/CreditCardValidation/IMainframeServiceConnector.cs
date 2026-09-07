namespace EasyTrade.BrokerService.Middleware.CreditCardValidation;

public interface IMainframeServiceConnector
{
    Task<bool> ValidateCreditCardAsync(string cardNumber);
}
