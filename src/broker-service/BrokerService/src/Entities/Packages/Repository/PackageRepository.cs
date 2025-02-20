using EasyTrade.BrokerService.Helpers;
using Microsoft.EntityFrameworkCore;

namespace EasyTrade.BrokerService.Entities.Packages.Repository;

public class PackageRepository(BrokerDbContext dbContext)
    : TransactionalRepository(dbContext),
        IPackageRepository
{
    public async Task<Package?> GetPackage(int packageId) =>
        await DbContext.Packages.Where(x => x!.Id == packageId).FirstOrDefaultAsync();

    public IQueryable<Package?> GetAllPackages() => DbContext.Packages.AsQueryable();
}
