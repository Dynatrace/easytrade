using EasyTrade.BrokerService.Connectors;
using EasyTrade.BrokerService.Helpers;
using EasyTrade.DbAdapter.Product.Grpc;
using Google.Protobuf.WellKnownTypes;

namespace EasyTrade.BrokerService.Entities.Products.Repository;

public class ProductRepository(IDbAdapterConnector connector)
    : DbAdapterRepository<ProductService.ProductServiceClient>(connector, channel => new(channel)), IProductRepository
{
    public async Task<Product?> GetProductAsync(Guid productId) =>
        await GrpcHelper.ExecuteOrNullAsync(
            async () => ProductMapper.FromProto(await GetClient().GetProductByIdAsync(new GetProductRequest { Id = productId.ToString() }))
        );

    public async Task<List<Product>> GetProductsAsync() =>
        await GrpcHelper.ExecuteAsync(
            async () => ProductMapper.FromProto((await GetClient().GetProductsAsync(new Empty())).Products)
        );
}
