using EasyTrade.BrokerService.Entities.Instruments;
using EasyTrade.BrokerService.Entities.Instruments.Service;
using EasyTrade.BrokerService.Entities.Prices;
using EasyTrade.BrokerService.Entities.Products;
using EasyTrade.BrokerService.Test.Fakes;
using Microsoft.Extensions.Logging;

namespace EasyTrade.BrokerService.Test.UnitTests;

public class InstrumentTests
{
    private FakeInstrumentRepository? _instrumentRepository;
    private FakePriceServiceConnector? _priceServiceConnector;
    private FakeProductRepository? _productRepository;

    private readonly Instrument[] _instruments;
    private readonly Product[] _products;
    private readonly Price[] _prices;
    private readonly DateTimeOffset _time;

    public InstrumentTests()
    {
        _time = DateTimeOffset.Now;
        _instruments = new Instrument[]
        {
            new Instrument(1, 1, "code1", "name1", "desc1"),
            new Instrument(2, 1, "code2", "name2", "desc2")
        };
        _products = new Product[] { new Product(1, "prod1", 2.5M, "curr1") };
        _prices = new Price[]
        {
            new Price(1, _time.AddDays(-1), 2, 4, 1, 3),
            new Price(2, _time.AddDays(-1), 0.5M, 7, 0.25M, 4),
            new Price(1, _time, 3, 5, 1, 4.5M),
            new Price(2, _time, 4, 5, 1.5M, 2)
        };
    }

    [Fact]
    public async Task GetInstruments_WithValidInput_ShouldReturnInstruments()
    {
        // Arrange
        const int userId = 1;
        OwnedInstrument[] ownedInstruments =
        {
            new OwnedInstrument(userId, 1, 22.5M, _time),
            new OwnedInstrument(userId, 2, 59.28M, _time.AddDays(-1))
        };

        var instrumentService = BuildFakeInstrumentService(
            _instruments,
            ownedInstruments,
            _products,
            _prices
        );

        // Act
        var result = await instrumentService.GetInstruments(userId);
        var first = result.First(x => x.Id == 1);
        var second = result.First(x => x.Id == 2);
        // Assert
        Assert.Equal(_instruments.Length, result.Count());
        Assert.Equal(ownedInstruments[0].Quantity, first.Amount);
        Assert.Equal(ownedInstruments[1].Quantity, second.Amount);
        Assert.Equal(_prices[2].Open, first.Price.Open);
        Assert.Equal(_prices[3].High, second.Price.High);
        Assert.Equal(_products[0].Name, first.ProductName);
        Assert.Equal(_instruments[0].Code, first.Code);
        Assert.Equal(_instruments[1].Name, second.Name);
    }

    [Fact]
    public async Task GetInstruments_WithInvalidAccount_ShouldReturnInstruments()
    {
        // Arrange
        var instrumentService = BuildFakeInstrumentService(
            _instruments,
            Array.Empty<OwnedInstrument>(),
            _products,
            _prices
        );

        // Act
        var result = await instrumentService.GetInstruments(0);
        var first = result.First(x => x.Id == 1);
        var second = result.First(x => x.Id == 2);
        // Assert
        Assert.Equal(_instruments.Length, result.Count());
        Assert.Equal(0, first.Amount);
        Assert.Equal(0, second.Amount);
        Assert.Equal(_prices[2].Open, first.Price.Open);
        Assert.Equal(_prices[3].High, second.Price.High);
        Assert.Equal(_products[0].Name, first.ProductName);
        Assert.Equal(_instruments[0].Code, first.Code);
        Assert.Equal(_instruments[1].Name, second.Name);
    }

    private InstrumentService BuildFakeInstrumentService(
        Instrument[] instruments,
        OwnedInstrument[] ownedInstruments,
        Product[] products,
        Price[] prices
    )
    {
        _instrumentRepository = new FakeInstrumentRepository(
            instruments.ToList(),
            ownedInstruments.ToList()
        );
        _priceServiceConnector = new FakePriceServiceConnector(prices.ToList());
        _productRepository = new FakeProductRepository(products.ToList());
        var logger = new Mock<ILogger<InstrumentService>>().Object;
        return new InstrumentService(
            _instrumentRepository,
            _priceServiceConnector,
            _productRepository,
            logger
        );
    }
}
