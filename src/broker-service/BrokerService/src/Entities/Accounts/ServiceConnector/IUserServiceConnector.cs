namespace EasyTrade.BrokerService.Entities.Accounts.ServiceConnector;

public interface IUserServiceConnector
{
    public Task<Account> GetAccountById(int id);
}
