using EasyTrade.BrokerService.Entities.Prices;
using EasyTrade.BrokerService.Entities.Prices.DTO;
using EasyTrade.BrokerService.Entities.Products;

namespace EasyTrade.BrokerService.Entities.Instruments.DTO;

public class InstrumentDTO
{
    public Guid Id { get; set; }
    public string Code { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; }
    public PriceDTO Price { get; set; }
    public decimal Amount { get; set; }

    public InstrumentDTO(
        Instrument instrument,
        OwnedInstrument? ownedInstrument,
        Product product,
        Price price
    )
    {
        Id = instrument.Id;
        Code = instrument.Code;
        Name = instrument.Name;
        Description = instrument.Description;
        ProductId = product.Id;
        ProductName = product.Name;
        Price = new PriceDTO(price);
        Amount = ownedInstrument is null ? 0 : ownedInstrument.Quantity;
    }

    public InstrumentDTO(
        Guid id,
        string code,
        string name,
        string description,
        Guid productId,
        string productName,
        PriceDTO price,
        decimal amount
    )
    {
        Id = id;
        Code = code;
        Name = name;
        Description = description;
        ProductId = productId;
        ProductName = productName;
        Price = price;
        Amount = amount;
    }
}
