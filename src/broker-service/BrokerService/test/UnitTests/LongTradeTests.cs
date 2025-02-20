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

public class LongTradeTests
{
    private FakeBalanceRepository? _balanceRepository;
    private FakeInstrumentRepository? _instrumentRepository;
    private FakePriceServiceConnector? _priceServiceConnector;
    private FakeProductRepository? _productRepository;
    private FakeTradeRepository? _tradeRepository;

    [Fact]
    public async Task LongBuy_WithValidInput_ShouldCreateTrade()
    {
        //Arrange
        const int userId = 2;
        const decimal balance = 10000;
        var time = DateTimeOffset.Now;
        const decimal quantity1 = 1.5M,
            quantity2 = 8;
        const decimal baseQuantity1 = 2;
        const decimal price1 = 2,
            price2 = 3;
        const int duration = 24;
        Balance[] balances = { new Balance(userId, balance) };
        Instrument[] instruments =
        {
            new Instrument(1, 1, "code1", "name1", "desc1"),
            new Instrument(2, 1, "code2", "name2", "desc2")
        };
        OwnedInstrument[] ownedInstruments =
        {
            new OwnedInstrument(userId, 1, baseQuantity1, time)
        };
        Product[] products = { new Product(1, "prod1", 2.5M, "curr1") };
        Price[] prices = { new Price(1, time, 3, 5, 1, 4.5M), new Price(2, time, 4, 5, 1.5M, 2) };
        var tradeService = BuildFakeLongTradeService(
            balances,
            Array.Empty<BalanceHistory>(),
            instruments,
            ownedInstruments,
            products,
            prices,
            Array.Empty<Trade>()
        );
        // Act
        await tradeService.BuyAssets(userId, 1, quantity1, duration, price1);
        await tradeService.BuyAssets(userId, 2, quantity2, duration, price2);
        // Assert
        var trades = _tradeRepository!.GetAllTrades().ToList();
        var first = trades.Find(x => x.InstrumentId == 1)!;
        var second = trades.Find(x => x.InstrumentId == 2)!;
        Assert.Equal(2, trades.Count);
        trades.ForEach(trade =>
        {
            Assert.False(trade.TradeClosed);
            Assert.False(trade.TransactionHappened);
            Assert.Equal(nameof(ActionType.LongBuy).ToLower(), trade.Direction);
            var timespan = (TimeSpan)(trade.TimestampClose - trade.TimestampOpen)!;
            Assert.Equal(duration, timespan.TotalHours, 3);
        });
        Assert.Equal(price1, first.EntryPrice);
        Assert.Equal(price2, second.EntryPrice);
        Assert.Equal(quantity1, first.Quantity);
        Assert.Equal(quantity2, second.Quantity);
    }

    [Fact]
    public async Task LongSell_WithValidInput_ShouldCreateTrade()
    {
        //Arrange
        const int userId = 2;
        const decimal balance = 10000;
        var time = DateTimeOffset.Now;
        const decimal quantity1 = 1.5M,
            quantity2 = 8;
        const decimal baseQuantity1 = 2;
        const decimal price1 = 2,
            price2 = 3;
        const int duration = 24;
        Balance[] balances = { new Balance(userId, balance) };
        Instrument[] instruments =
        {
            new Instrument(1, 1, "code1", "name1", "desc1"),
            new Instrument(2, 1, "code2", "name2", "desc2")
        };
        OwnedInstrument[] ownedInstruments =
        {
            new OwnedInstrument(userId, 1, baseQuantity1, time)
        };
        Product[] products = { new Product(1, "prod1", 2.5M, "curr1") };
        Price[] prices = { new Price(1, time, 3, 5, 1, 4.5M), new Price(2, time, 4, 5, 1.5M, 2) };
        var tradeService = BuildFakeLongTradeService(
            balances,
            Array.Empty<BalanceHistory>(),
            instruments,
            ownedInstruments,
            products,
            prices,
            Array.Empty<Trade>()
        );
        // Act
        await tradeService.SellAssets(userId, 1, quantity1, duration, price1);
        await tradeService.SellAssets(userId, 2, quantity2, duration, price2);
        // Assert
        var trades = _tradeRepository!.GetAllTrades().ToList();
        var first = trades.Find(x => x.InstrumentId == 1)!;
        var second = trades.Find(x => x.InstrumentId == 2)!;
        Assert.Equal(2, trades.Count);
        trades.ForEach(trade =>
        {
            Assert.False(trade.TradeClosed);
            Assert.False(trade.TransactionHappened);
            Assert.Equal(nameof(ActionType.LongSell).ToLower(), trade.Direction);
            var timespan = (TimeSpan)(trade.TimestampClose - trade.TimestampOpen)!;
            Assert.Equal(duration, timespan.TotalHours, 3);
        });
        Assert.Equal(price1, first.EntryPrice);
        Assert.Equal(price2, second.EntryPrice);
        Assert.Equal(quantity1, first.Quantity);
        Assert.Equal(quantity2, second.Quantity);
    }

    [Fact]
    public async Task LongBuySell_WithNegativeAmount_ShouldThrowException()
    {
        //Arrange
        const int userId = 2;
        const decimal amount = -12.5M;
        var tradeService = BuildFakeLongTradeService(
            Array.Empty<Balance>(),
            Array.Empty<BalanceHistory>(),
            Array.Empty<Instrument>(),
            Array.Empty<OwnedInstrument>(),
            Array.Empty<Product>(),
            Array.Empty<Price>(),
            Array.Empty<Trade>()
        );
        // Act & Assert
        await Assert.ThrowsAsync<NegativeAmountException>(
            () => tradeService.BuyAssets(userId, 1, amount, 1, 1)
        );
        await Assert.ThrowsAsync<NegativeAmountException>(
            () => tradeService.SellAssets(userId, 1, amount, 1, 1)
        );
    }

    [Fact]
    public async Task LongBuySell_WithInvalidUserId_ShouldThrowException()
    {
        //Arrange
        const int userId = 2;
        var tradeService = BuildFakeLongTradeService(
            Array.Empty<Balance>(),
            Array.Empty<BalanceHistory>(),
            Array.Empty<Instrument>(),
            Array.Empty<OwnedInstrument>(),
            Array.Empty<Product>(),
            Array.Empty<Price>(),
            Array.Empty<Trade>()
        );
        // Act & Assert
        await Assert.ThrowsAsync<AccountNotFoundException>(
            () => tradeService.BuyAssets(userId, 1, 1, 1, 1)
        );
        await Assert.ThrowsAsync<AccountNotFoundException>(
            () => tradeService.SellAssets(userId, 1, 1, 1, 1)
        );
    }

    [Fact]
    public async Task LongBuySell_WithInvalidInstrumentId_ShouldThrowException()
    {
        //Arrange
        const int userId = 2;
        Balance[] balances = { new Balance(userId, 0), };
        var tradeService = BuildFakeLongTradeService(
            balances,
            Array.Empty<BalanceHistory>(),
            Array.Empty<Instrument>(),
            Array.Empty<OwnedInstrument>(),
            Array.Empty<Product>(),
            Array.Empty<Price>(),
            Array.Empty<Trade>()
        );
        // Act & Assert
        await Assert.ThrowsAsync<InstrumentNotFoundException>(
            () => tradeService.BuyAssets(userId, 1, 1, 1, 1)
        );
        await Assert.ThrowsAsync<InstrumentNotFoundException>(
            () => tradeService.SellAssets(userId, 1, 1, 1, 1)
        );
    }

    [Fact]
    public async Task LongBuySell_WithInvalidPrice_ShouldThrowException()
    {
        //Arrange
        const int userId = 2;
        const decimal price = -1;
        Balance[] balances = { new Balance(userId, 0) };
        var tradeService = BuildFakeLongTradeService(
            balances,
            Array.Empty<BalanceHistory>(),
            Array.Empty<Instrument>(),
            Array.Empty<OwnedInstrument>(),
            Array.Empty<Product>(),
            Array.Empty<Price>(),
            Array.Empty<Trade>()
        );
        // Act & Assert
        await Assert.ThrowsAsync<NegativeAmountException>(
            () => tradeService.BuyAssets(userId, 1, 1, 1, price)
        );
        await Assert.ThrowsAsync<NegativeAmountException>(
            () => tradeService.SellAssets(userId, 1, 1, 1, price)
        );
    }

    [Fact]
    public async Task LongBuySell_WithInvalidDuration_ShouldThrowException()
    {
        //Arrange
        const int userId = 2;
        const int duration = -1;
        Balance[] balances = { new Balance(userId, 0) };
        var tradeService = BuildFakeLongTradeService(
            balances,
            Array.Empty<BalanceHistory>(),
            Array.Empty<Instrument>(),
            Array.Empty<OwnedInstrument>(),
            Array.Empty<Product>(),
            Array.Empty<Price>(),
            Array.Empty<Trade>()
        );
        // Act & Assert
        await Assert.ThrowsAsync<NegativeAmountException>(
            () => tradeService.BuyAssets(userId, 1, 1, duration, 1)
        );
        await Assert.ThrowsAsync<NegativeAmountException>(
            () => tradeService.SellAssets(userId, 1, 1, duration, 1)
        );
    }

    [Fact]
    public async Task CloseOverdueTrades_WithValidInput_ShouldCloseTrades()
    {
        // Arrange
        var time = DateTimeOffset.Now;
        Trade[] trades =
        {
            new Trade(
                1,
                1,
                1,
                nameof(ActionType.LongBuy).ToLower(),
                1,
                1,
                time.AddDays(-2),
                time.AddDays(-1),
                false,
                false,
                ""
            ),
            new Trade(
                2,
                1,
                1,
                nameof(ActionType.LongBuy).ToLower(),
                1,
                1,
                time.AddDays(-1),
                time.AddDays(1),
                false,
                false,
                ""
            ),
            new Trade(
                3,
                1,
                1,
                nameof(ActionType.LongSell).ToLower(),
                1,
                1,
                time.AddHours(-2),
                time.AddHours(-1),
                false,
                false,
                ""
            )
        };
        Price[] prices = { new Price(1, time, 10, 10, 10, 10) };
        Instrument[] instruments = { new Instrument(1, 1, "code1", "name1", "desc1") };
        Product[] products = { new Product(1, "prod1", 2.5M, "curr1") };
        var tradeService = BuildFakeLongTradeService(
            Array.Empty<Balance>(),
            Array.Empty<BalanceHistory>(),
            instruments,
            Array.Empty<OwnedInstrument>(),
            products,
            prices,
            trades
        );
        // Act
        await tradeService.ProcessLongRunningTransactions();
        var allTrades = _tradeRepository!.GetAllTrades().ToList();
        var openTrades = allTrades.Where(x => !x.TradeClosed).ToList();
        // Assert
        Assert.Single(openTrades);
        Assert.Equal(2, openTrades[0].Id);
    }

    [Fact]
    public async Task ProcessLongRunningTransactions_WithValidInput_ShouldCompleteTransactions()
    {
        // Arrange
        var time = DateTimeOffset.Now;
        const int ownerId = 1,
            userId = 2;
        const int instrumentId = 1;
        const decimal buyAmount = 1500,
            sellAmount = 1000;
        const decimal baseQuantity = 2.5M,
            baseBalance = 10000;
        const decimal buyPrice = 4.5M,
            sellPrice = 6.5M;
        const decimal ppt = 2.5M;
        const decimal open = 5.5M,
            close = 5.5M,
            low = 4,
            high = 7;
        Trade[] trades =
        {
            new Trade(
                1,
                userId,
                instrumentId,
                nameof(ActionType.LongBuy).ToLower(),
                buyAmount,
                buyPrice,
                time.AddDays(-1),
                time.AddDays(1),
                false,
                false,
                ""
            ),
            new Trade(
                2,
                userId,
                instrumentId,
                nameof(ActionType.LongSell).ToLower(),
                sellAmount,
                sellPrice,
                time.AddHours(-1),
                time.AddHours(1),
                false,
                false,
                ""
            )
        };
        Balance[] balances = { new Balance(ownerId, 0), new Balance(userId, baseBalance) };
        OwnedInstrument[] ownedInstruments =
        {
            new OwnedInstrument(userId, instrumentId, baseQuantity, time.AddDays(-1))
        };
        Price[] prices = { new Price(1, time, open, high, low, close) };
        Instrument[] instruments = { new Instrument(instrumentId, 1, "code1", "name1", "desc1") };
        Product[] products = { new Product(1, "prod1", ppt, "curr1") };
        var tradeService = BuildFakeLongTradeService(
            balances,
            Array.Empty<BalanceHistory>(),
            instruments,
            ownedInstruments,
            products,
            prices,
            trades
        );
        // Act
        await tradeService.ProcessLongRunningTransactions();
        // Assert
        var ownerBalance = (await _balanceRepository!.GetBalanceOfAccount(ownerId))!.Value;
        var userBalance = (await _balanceRepository!.GetBalanceOfAccount(userId))!.Value;
        var userOwnedInstruments = _instrumentRepository!
            .GetOwnedInstrumentsOfAccount(userId)
            .ToList();
        var allTrades = _tradeRepository!.GetAllTrades().ToList();
        var balanceHistories = _balanceRepository.GetBalanceHistories().ToList();

        const decimal expectedBalance =
            baseBalance - (buyAmount * buyPrice) + (sellAmount * sellPrice) - (2 * ppt);
        Assert.Equal(2 * ppt, ownerBalance);
        Assert.Equal(expectedBalance, userBalance);
        allTrades.ForEach(trade =>
        {
            Assert.True(trade.TradeClosed);
            Assert.True(trade.TransactionHappened);
        });
        Assert.Equal(6, balanceHistories.Count);
        const decimal expectedAmount = baseQuantity - sellAmount + buyAmount;
        Assert.Equal(expectedAmount, userOwnedInstruments[0].Quantity);
    }

    private LongTradeService BuildFakeLongTradeService(
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
            balances.ToList(),
            balanceHistories.ToList()
        );
        _instrumentRepository = new FakeInstrumentRepository(
            instruments.ToList(),
            ownedInstruments.ToList()
        );
        _priceServiceConnector = new FakePriceServiceConnector(prices.ToList());
        _productRepository = new FakeProductRepository(products.ToList());
        _tradeRepository = new FakeTradeRepository(trades.ToList());
        var notificationService = new FakeNotificationService();
        var logger = new Mock<ILogger<LongTradeService>>().Object;
        return new LongTradeService(
            _balanceRepository,
            _instrumentRepository,
            _priceServiceConnector,
            _productRepository,
            _tradeRepository,
            logger,
            notificationService
        );
    }
}
