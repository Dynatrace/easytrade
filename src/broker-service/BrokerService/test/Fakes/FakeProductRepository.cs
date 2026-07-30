using EasyTrade.BrokerService.Entities.Products;
using EasyTrade.BrokerService.Entities.Products.Repository;

namespace EasyTrade.BrokerService.Test.Fakes;

public class FakeProductRepository : IProductRepository
{
    private readonly List<Product> _products = new();

    public FakeProductRepository(List<Product> products) => _products = products;

    public FakeProductRepository() { }

    public FakeProductRepository AddProduct(Product product)
    {
        _products.Add(product);
        return this;
    }

    public Task<Product?> GetProductAsync(Guid productId)
    {
        var product = _products.Find(x => x.Id == productId);
        return Task.FromResult(product);
    }

    public Task<List<Product>> GetProductsAsync() =>
        Task.FromResult(_products.ToList());
}
