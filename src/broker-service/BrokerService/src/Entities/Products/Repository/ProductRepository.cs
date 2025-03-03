using EasyTrade.BrokerService.Helpers;
using Microsoft.EntityFrameworkCore;

namespace EasyTrade.BrokerService.Entities.Products.Repository;

public class ProductRepository(BrokerDbContext dbContext)
    : TransactionalRepository(dbContext),
        IProductRepository
{
    public async Task<Product?> GetProduct(int productId) =>
        await DbContext.Products.Where(x => x.Id == productId).FirstOrDefaultAsync();

    public IQueryable<Product> GetProducts() => DbContext.Products.AsQueryable();
}
