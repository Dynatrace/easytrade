using EasyTrade.BrokerService.Helpers;

namespace EasyTrade.BrokerService.Entities.Packages.Repository;

public interface IPackageRepository : ITransactionalRepository
{
    public Task<Package?> GetPackage(int packageId);

    public IQueryable<Package?> GetAllPackages();
}
