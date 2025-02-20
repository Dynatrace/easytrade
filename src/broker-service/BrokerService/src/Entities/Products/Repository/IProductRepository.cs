using EasyTrade.BrokerService.Helpers;

namespace EasyTrade.BrokerService.Entities.Products.Repository;

public interface IProductRepository : ITransactionalRepository
{
    public Task<Product?> GetProduct(int productId);
    public IQueryable<Product> GetProducts();
}
