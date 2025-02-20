namespace EasyTrade.BrokerService.Helpers;

public interface ITransactionalRepository
{
    public Task BeginTransaction();
    public Task CommitTransaction();
    public Task RollbackTransaction();
    public Task SaveChanges();
}
