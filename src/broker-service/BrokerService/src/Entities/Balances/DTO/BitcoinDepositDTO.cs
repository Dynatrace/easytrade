namespace EasyTrade.BrokerService.Entities.Balances.DTO;

public class BitcoinDepositDTO(decimal btcAmount, string walletAddress)
{
    public decimal BtcAmount { get; set; } = btcAmount;
    public string WalletAddress { get; set; } = walletAddress;
}
