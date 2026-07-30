namespace EasyTrade.BrokerService.Entities.Accounts.ServiceConnector;

public interface IAccountServiceConnector
{
    public Task<Account> GetAccountById(Guid id);
}
