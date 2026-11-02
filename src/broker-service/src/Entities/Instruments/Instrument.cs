namespace EasyTrade.BrokerService.Entities.Instruments;

public class Instrument(string code, string name, string description)
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string Code { get; set; } = code;
    public string Name { get; set; } = name;
    public string Description { get; set; } = description;

    public Instrument(Guid id, Guid productId, string code, string name, string description)
        : this(code, name, description)
    {
        Id = id;
        ProductId = productId;
    }
}
