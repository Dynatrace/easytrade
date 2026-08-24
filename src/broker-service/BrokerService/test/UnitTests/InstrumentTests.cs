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
    private readonly Guid _instrumentId1;
    private readonly Guid _instrumentId2;
    private readonly Guid _productId;

    public InstrumentTests()
    {
        _time = DateTimeOffset.Now;
        _instrumentId1 = Guid.NewGuid();
        _instrumentId2 = Guid.NewGuid();
        _productId = Guid.NewGuid();
        _instruments = new Instrument[]
        {
            new Instrument(_instrumentId1, _productId, "code1", "name1", "desc1"),
            new Instrument(_instrumentId2, _productId, "code2", "name2", "desc2")
        };
        _products = new Product[] { new Product(_productId, "prod1", 2.5M, "curr1") };
        _prices = new Price[]
        {
            new Price(_instrumentId1, _time.AddDays(-1), 2, 4, 1, 3),
            new Price(_instrumentId2, _time.AddDays(-1), 0.5M, 7, 0.25M, 4),
            new Price(_instrumentId1, _time, 3, 5, 1, 4.5M),
            new Price(_instrumentId2, _time, 4, 5, 1.5M, 2)
        };
    }

    [Fact]
    public async Task GetInstruments_WithValidInput_ShouldReturnInstruments()
    {
        // Arrange
        var userId = Guid.NewGuid();
        OwnedInstrument[] ownedInstruments =
        {
            new OwnedInstrument(userId, _instrumentId1, 22.5M, _time),
            new OwnedInstrument(userId, _instrumentId2, 59.28M, _time.AddDays(-1))
        };

        var instrumentService = BuildFakeInstrumentService(
            _instruments,
            ownedInstruments,
            _products,
            _prices
        );

        // Act
        var result = await instrumentService.GetInstruments(userId);
        var first = result.First(x => x.Id == _instrumentId1);
        var second = result.First(x => x.Id == _instrumentId2);
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
        var accountId = Guid.NewGuid();
        var instrumentService = BuildFakeInstrumentService(
            _instruments,
            Array.Empty<OwnedInstrument>(),
            _products,
            _prices
        );

        // Act
        var result = await instrumentService.GetInstruments(accountId);
        var first = result.First(x => x.Id == _instrumentId1);
        var second = result.First(x => x.Id == _instrumentId2);
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

    [Fact]
    public async Task GetInstruments_WhenSomeInstrumentsAbsentFromSnapshot_ShouldReturnOnlyResolvableInstruments()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var orphanedProductId = Guid.NewGuid();
        var missingPriceInstrumentId = Guid.NewGuid();
        Instrument[] instruments =
        {
            new Instrument(_instrumentId1, _productId, "code1", "name1", "desc1"),
            new Instrument(_instrumentId2, orphanedProductId, "code2", "name2", "desc2"), // product missing
            new Instrument(missingPriceInstrumentId, _productId, "code3", "name3", "desc3"), // price missing
        };
        Price[] prices = { new Price(_instrumentId1, _time, 3, 5, 1, 4.5M) }; // only _instrumentId1 has a price
        var instrumentService = BuildFakeInstrumentService(
            instruments,
            Array.Empty<OwnedInstrument>(),
            _products,
            prices
        );

        // Act
        var result = (await instrumentService.GetInstruments(userId)).ToList();

        // Assert
        Assert.Single(result);
        Assert.Equal(_instrumentId1, result[0].Id);
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
