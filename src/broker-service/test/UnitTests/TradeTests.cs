using EasyTrade.BrokerService.Entities.Balances;
using EasyTrade.BrokerService.Entities.Instruments;
using EasyTrade.BrokerService.Entities.Prices;
using EasyTrade.BrokerService.Entities.Products;
using EasyTrade.BrokerService.Entities.Trades;
using EasyTrade.BrokerService.Entities.Trades.Service;
using EasyTrade.BrokerService.ExceptionHandling.Exceptions;
using EasyTrade.BrokerService.Helpers;
using EasyTrade.BrokerService.Test.Fakes;
using Microsoft.Extensions.Logging;

namespace EasyTrade.BrokerService.Test.UnitTests;

public class TradeTests
{
    private FakeBalanceRepository? _balanceRepository;
    private FakeInstrumentRepository? _instrumentRepository;
    private FakePriceServiceConnector? _priceServiceConnector;
    private FakeProductRepository? _productRepository;
    private FakeTradeRepository? _tradeRepository;

    [Fact]
    public async Task QuickBuy_WithValidInput_ShouldBuyAsset()
    {
        //Arrange
        var userId = Guid.NewGuid();
        var instrumentId1 = Guid.NewGuid();
        var instrumentId2 = Guid.NewGuid();
        var productId = Guid.NewGuid();
        const decimal balance = 10000;
        var time = DateTimeOffset.Now;
        const decimal quantity1 = 1.5M,
            quantity2 = 8,
            baseQuantity1 = 2;
        Balance[] balances = [new Balance(Constants.OwnerId, 0), new Balance(userId, balance)];
        Instrument[] instruments =
        [
            new Instrument(instrumentId1, productId, "code1", "name1", "desc1"),
            new Instrument(instrumentId2, productId, "code2", "name2", "desc2")
        ];
        OwnedInstrument[] ownedInstruments =
        [
            new OwnedInstrument(userId, instrumentId1, baseQuantity1, time)
        ];
        Product[] products = [new Product(productId, "prod1", 2.5M, "curr1")];
        Price[] prices = [new Price(instrumentId1, time, 3, 5, 1, 4.5M), new Price(instrumentId2, time, 4, 5, 1.5M, 2)];
        var tradeService = BuildFakeTradeService(
            balances,
            [],
            instruments,
            ownedInstruments,
            products,
            prices,
            []
        );
        // Act
        await tradeService.BuyAssets(userId, instrumentId1, quantity1);
        await tradeService.BuyAssets(userId, instrumentId2, quantity2);
        // Assert
        var newBalance = (await _balanceRepository!.GetBalanceOfAccountAsync(userId))!.Value;
        var ownerBalance = (await _balanceRepository!.GetBalanceOfAccountAsync(Constants.OwnerId))!.Value;
        var ownedInstrument = _instrumentRepository!.GetOwnedInstrumentsOfAccount(userId).ToList();
        var balanceHistories = _balanceRepository.GetBalanceHistories().ToList();
        var trades = _tradeRepository!.GetAllTrades().ToList();

        var expectedOwnerIncome = 2 * products[0].Ppt;
        var expectedCost =
            (quantity1 * prices[0].Open) + (quantity2 * prices[1].Open) + expectedOwnerIncome;

        Assert.Equal(balance - expectedCost, newBalance);
        Assert.Equal(expectedOwnerIncome, ownerBalance);

        Assert.Equal(
            baseQuantity1 + quantity1,
            ownedInstrument.Find(x => x.InstrumentId == instrumentId1)!.Quantity
        );
        Assert.Equal(quantity2, ownedInstrument.Find(x => x.InstrumentId == instrumentId2)!.Quantity);

        Assert.Equal(6, balanceHistories.Count);
        Assert.Equal(2, trades.Count);
        trades.ForEach(trade =>
        {
            Assert.True(trade.TradeClosed);
            Assert.True(trade.TransactionHappened);
            Assert.Equal(nameof(ActionType.Buy).ToLower(), trade.Direction);
        });
    }

    [Fact]
    public async Task QuickSell_WithValidInput_ShouldBuyAsset()
    {
        //Arrange
        var userId = Guid.NewGuid();
        var instrumentId1 = Guid.NewGuid();
        var instrumentId2 = Guid.NewGuid();
        var productId = Guid.NewGuid();
        const decimal balance = 10000;
        var time = DateTimeOffset.Now;
        const decimal quantity1 = 1.5M,
            quantity2 = 8;
        const decimal baseQuantity1 = 2,
            baseQuantity2 = 10;
        Balance[] balances = [new Balance(Constants.OwnerId, 0), new Balance(userId, balance)];
        Instrument[] instruments =
        [
            new Instrument(instrumentId1, productId, "code1", "name1", "desc1"),
            new Instrument(instrumentId2, productId, "code2", "name2", "desc2")
        ];
        OwnedInstrument[] ownedInstruments =
        [
            new OwnedInstrument(userId, instrumentId1, baseQuantity1, time),
            new OwnedInstrument(userId, instrumentId2, baseQuantity2, time)
        ];
        Product[] products = [new Product(productId, "prod1", 2.5M, "curr1")];
        Price[] prices = [new Price(instrumentId1, time, 3, 5, 1, 4.5M), new Price(instrumentId2, time, 4, 5, 1.5M, 2)];
        var tradeService = BuildFakeTradeService(
            balances,
            [],
            instruments,
            ownedInstruments,
            products,
            prices,
            []
        );
        // Act
        await tradeService.SellAssets(userId, instrumentId1, quantity1);
        await tradeService.SellAssets(userId, instrumentId2, quantity2);

        // Assert
        var newBalance = (await _balanceRepository!.GetBalanceOfAccountAsync(userId))!.Value;
        var ownerBalance = (await _balanceRepository!.GetBalanceOfAccountAsync(Constants.OwnerId))!.Value;
        var ownedInstrument = _instrumentRepository!.GetOwnedInstrumentsOfAccount(userId).ToList();
        var balanceHistories = _balanceRepository.GetBalanceHistories().ToList();
        var trades = _tradeRepository!.GetAllTrades().ToList();

        var expectedOwnerIncome = 2 * products[0].Ppt;
        var expectedIncome =
            (quantity1 * prices[0].Open) + (quantity2 * prices[1].Open) - expectedOwnerIncome;

        Assert.Equal(balance + expectedIncome, newBalance);
        Assert.Equal(expectedOwnerIncome, ownerBalance);

        Assert.Equal(
            baseQuantity1 - quantity1,
            ownedInstrument.Find(x => x.InstrumentId == instrumentId1)!.Quantity
        );
        Assert.Equal(
            baseQuantity2 - quantity2,
            ownedInstrument.Find(x => x.InstrumentId == instrumentId2)!.Quantity
        );

        Assert.Equal(6, balanceHistories.Count);
        Assert.Equal(2, trades.Count);
        trades.ForEach(trade =>
        {
            Assert.True(trade.TradeClosed);
            Assert.True(trade.TransactionHappened);
            Assert.Equal(nameof(ActionType.Sell).ToLower(), trade.Direction);
        });
    }

    [Fact]
    public async Task QuickBuySell_WithNegativeAmount_ShouldThrowException()
    {
        //Arrange
        var userId = Guid.NewGuid();
        var instrumentId = Guid.NewGuid();
        const decimal amount = -12.5M;
        var tradeService = BuildFakeTradeService(
            [],
            [],
            [],
            [],
            [],
            [],
            []
        );
        // Act & Assert
        await Assert.ThrowsAsync<NegativeAmountException>(
            () => tradeService.BuyAssets(userId, instrumentId, amount)
        );
        await Assert.ThrowsAsync<NegativeAmountException>(
            () => tradeService.SellAssets(userId, instrumentId, amount)
        );
    }

    [Fact]
    public async Task QuickBuySell_WithInvalidUserId_ShouldThrowException()
    {
        //Arrange
        var userId = Guid.NewGuid();
        var instrumentId = Guid.NewGuid();
        var tradeService = BuildFakeTradeService(
            [],
            [],
            [],
            [],
            [],
            [],
            []
        );
        // Act & Assert
        await Assert.ThrowsAsync<BalanceNotFoundException>(
            () => tradeService.BuyAssets(userId, instrumentId, 1)
        );
        await Assert.ThrowsAsync<BalanceNotFoundException>(
            () => tradeService.SellAssets(userId, instrumentId, 1)
        );
    }

    [Fact]
    public async Task QuickBuySell_WithInvalidInstrumentId_ShouldThrowException()
    {
        //Arrange
        var userId = Guid.NewGuid();
        var instrumentId = Guid.NewGuid();
        Balance[] balances = [new Balance(userId, 0),];
        var tradeService = BuildFakeTradeService(
            balances,
            [],
            [],
            [],
            [],
            [],
            []
        );
        // Act & Assert
        await Assert.ThrowsAsync<InstrumentNotFoundException>(
            () => tradeService.BuyAssets(userId, instrumentId, 1)
        );
        await Assert.ThrowsAsync<InstrumentNotFoundException>(
            () => tradeService.SellAssets(userId, instrumentId, 1)
        );
    }

    [Fact]
    public async Task QuickBuy_NotEnoughMoney_ShouldThrowException()
    {
        //Arrange
        var userId = Guid.NewGuid();
        var instrumentId = Guid.NewGuid();
        var productId = Guid.NewGuid();
        Balance[] balances = [new Balance(userId, 3)];
        Instrument[] instruments = [new Instrument(instrumentId, productId, "code1", "name1", "desc1")];
        Product[] products = [new Product(productId, "prod1", 2.5M, "curr1")];
        Price[] prices = [new Price(instrumentId, DateTimeOffset.Now, 3, 5, 1, 4.5M),];
        var tradeService = BuildFakeTradeService(
            balances,
            [],
            instruments,
            [],
            products,
            prices,
            []
        );
        // Act & Assert
        await Assert.ThrowsAsync<NotEnoughMoneyException>(
            () => tradeService.BuyAssets(userId, instrumentId, 1)
        );
    }

    [Fact]
    public async Task QuickSell_NotEnoughAssets_ShouldThrowException()
    {
        //Arrange
        var userId = Guid.NewGuid();
        var instrumentId1 = Guid.NewGuid();
        var instrumentId2 = Guid.NewGuid();
        var productId = Guid.NewGuid();
        const decimal baseQuantity1 = 10,
            sellQuantity = 15;
        Balance[] balances = [new Balance(userId, 0)];
        Instrument[] instruments =
        [
            new Instrument(instrumentId1, productId, "code1", "name1", "desc1"),
            new Instrument(instrumentId2, productId, "code1", "name1", "desc1")
        ];
        OwnedInstrument[] ownedInstruments =
        [
            new OwnedInstrument(userId, instrumentId1, baseQuantity1, DateTimeOffset.Now)
        ];
        Product[] products = [new Product(productId, "prod1", 2.5M, "curr1")];
        Price[] prices =
        [
            new Price(instrumentId1, DateTimeOffset.Now, 3, 5, 1, 4.5M),
            new Price(instrumentId2, DateTimeOffset.Now, 3, 5, 1, 4.5M)
        ];
        var tradeService = BuildFakeTradeService(
            balances,
            [],
            instruments,
            ownedInstruments,
            products,
            prices,
            []
        );
        // Act & Assert
        await Assert.ThrowsAsync<NotEnoughAssetsException>(
            () => tradeService.SellAssets(userId, instrumentId1, sellQuantity)
        );
        await Assert.ThrowsAsync<InstrumentNotFoundException>(
            () => tradeService.SellAssets(userId, instrumentId2, sellQuantity)
        );
    }

    [Fact]
    public async Task GetTradesOfAccount_WithValidInput_ShouldReturnTrades()
    {
        //Arrange
        var userId = Guid.NewGuid();
        var instrumentId1 = Guid.NewGuid();
        var instrumentId2 = Guid.NewGuid();
        var instrumentId3 = Guid.NewGuid();
        var instrumentId4 = Guid.NewGuid();
        var instrumentId5 = Guid.NewGuid();
        const int count = 2;
        Trade[] trades =
        [
            Trade.QuickTrade(userId, instrumentId1, ActionType.Buy, 12.5M, 5),
            Trade.LongTrade(userId, instrumentId2, ActionType.LongSell, 1.5M, 10, 24),
            Trade.QuickTrade(userId, instrumentId3, ActionType.Sell, 8, 7.5M),
            Trade.LongTrade(userId, instrumentId4, ActionType.LongBuy, 8, 5.5M, 6),
            Trade.QuickTrade(userId, instrumentId5, ActionType.Sell, 2, 2),
        ];
        var tradeService = BuildFakeTradeService(
            [],
            [],
            [],
            [],
            [],
            [],
            trades
        );
        // Act
        List<IEnumerable<Trade>> tradesPages = [];
        var page = 0;
        while (true)
        {
            var tradesOnPage = await tradeService.GetTradesOfAccount(userId, count, page++);
            if (!tradesOnPage.Any())
            {
                break;
            }
            tradesPages.Add(tradesOnPage);
        }
        var openTrades = await tradeService.GetTradesOfAccount(userId, trades.Length, 0, true);

        // Assert
        Assert.Equal(3, tradesPages.Count);
        Assert.Single(tradesPages[2].ToList());
        Assert.Equal(trades[1], tradesPages[0].First());
        Assert.Equal(2, openTrades.Count());
    }

    private TradeService BuildFakeTradeService(
        Balance[] balances,
        BalanceHistory[] balanceHistories,
        Instrument[] instruments,
        OwnedInstrument[] ownedInstruments,
        Product[] products,
        Price[] prices,
        Trade[] trades
    )
    {
        _balanceRepository = new FakeBalanceRepository(
            [.. balances],
            [.. balanceHistories]
        );
        _instrumentRepository = new FakeInstrumentRepository(
            [.. instruments],
            [.. ownedInstruments]
        );
        _priceServiceConnector = new FakePriceServiceConnector([.. prices]);
        _productRepository = new FakeProductRepository([.. products]);
        _tradeRepository = new FakeTradeRepository([.. trades]);
        var logger = new Mock<ILogger<TradeService>>().Object;
        return new TradeService(
            _balanceRepository,
            _instrumentRepository,
            _priceServiceConnector,
            _productRepository,
            _tradeRepository,
            logger
        );
    }
}
