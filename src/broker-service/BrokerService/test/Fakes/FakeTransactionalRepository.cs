using EasyTrade.BrokerService.Helpers;

namespace EasyTrade.BrokerService.Test.Fakes;

public class FakeTransactionalRepository : ITransactionalRepository
{
    public Task BeginTransaction() => Task.CompletedTask;

    public Task CommitTransaction() => Task.CompletedTask;

    public Task RollbackTransaction() => Task.CompletedTask;

    public Task SaveChanges() => Task.CompletedTask;
}
