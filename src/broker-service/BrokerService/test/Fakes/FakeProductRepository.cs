using EasyTrade.BrokerService.Entities.Products;
using EasyTrade.BrokerService.Entities.Products.Repository;
using EasyTrade.BrokerService.Test.Helpers;

namespace EasyTrade.BrokerService.Test.Fakes;

public class FakeProductRepository : FakeTransactionalRepository, IProductRepository
{
    private readonly List<Product> _products = new();

    public FakeProductRepository(List<Product> products) => _products = products;

    public FakeProductRepository() { }

    public FakeProductRepository AddProduct(Product product)
    {
        _products.Add(product);
        return this;
    }

    public Task<Product?> GetProduct(int productId)
    {
        var product = _products.Find(x => x.Id == productId);
        return Task.FromResult(product);
    }

    public IQueryable<Product> GetProducts() => _products.AsAsyncQueryable();
}
