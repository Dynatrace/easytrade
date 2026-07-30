using EasyTrade.DbAdapter.Product.Grpc;

namespace EasyTrade.BrokerService.Entities.Products.Repository;

public static class ProductMapper
{
    public static Product FromProto(ProductMessage proto)
    {
        return new Product(
            id: Guid.Parse(proto.Id),
            name: proto.Name,
            ppt: (decimal)proto.Ppt,
            currency: proto.Currency
        );
    }

    public static List<Product> FromProto(IEnumerable<ProductMessage> proto)
    {
        return [.. proto.Select(FromProto)];
    }
}
