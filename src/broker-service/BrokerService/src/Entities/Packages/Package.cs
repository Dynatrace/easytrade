namespace EasyTrade.BrokerService.Entities.Packages;

public class Package(string name, decimal price, string support)
{
    public int Id { get; set; }
    public string Name { get; set; } = name;
    public decimal Price { get; set; } = price;
    public string Support { get; set; } = support;
}
