namespace EasyTrade.BrokerService.Entities.Balances.DTO;

public class DepositMoneyDTO(
    decimal amount,
    string name,
    string address,
    string email,
    string cardNumber,
    string cardType,
    string cvv
)
{
    public decimal Amount { get; set; } = amount;
    public string Name { get; set; } = name;
    public string Address { get; set; } = address;
    public string Email { get; set; } = email;
    public string CardNumber { get; set; } = cardNumber;
    public string CardType { get; set; } = cardType;
    public string Cvv { get; set; } = cvv;
}
