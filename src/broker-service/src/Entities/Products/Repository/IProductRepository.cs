namespace EasyTrade.BrokerService.Entities.Products.Repository;

public interface IProductRepository
{
    Task<Product?> GetProductAsync(Guid productId);

    Task<List<Product>> GetProductsAsync();
}
