namespace EasyTrade.BrokerService.Entities.Products;

public class Product(string name, decimal ppt, string currency)
{
    public Guid Id { get; set; }
    public string Name { get; set; } = name;
    public decimal Ppt { get; set; } = ppt;
    public string Currency { get; set; } = currency;

    public Product(Guid id, string name, decimal ppt, string currency)
        : this(name, ppt, currency)
    {
        Id = id;
    }
}
