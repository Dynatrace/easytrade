using EasyTrade.BrokerService.Entities.Balances;
using EasyTrade.BrokerService.Entities.Balances.Repository;
using EasyTrade.BrokerService.Entities.Instruments;
using EasyTrade.BrokerService.Entities.Instruments.Repository;
using EasyTrade.BrokerService.Entities.Prices;
using EasyTrade.BrokerService.Entities.Prices.ServiceConnector;
using EasyTrade.BrokerService.Entities.Products;
using EasyTrade.BrokerService.Entities.Products.Repository;
using EasyTrade.BrokerService.Entities.Trades.Notification;
using EasyTrade.BrokerService.Entities.Trades.Repository;
using EasyTrade.BrokerService.ExceptionHandling.Exceptions;
using EasyTrade.BrokerService.Helpers;

namespace EasyTrade.BrokerService.Entities.Trades.Service;

public class LongTradeService(
    IBalanceRepository balanceRepository,
    IInstrumentRepository instrumentRepository,
    IPriceServiceConnector priceService,
    IProductRepository productRepository,
    ITradeRepository tradeRepository,
    ILogger<LongTradeService> logger,
    ITradeNotificationService notificationService
)
    : TradeServiceBase(
        balanceRepository,
        instrumentRepository,
        priceService,
        productRepository,
        tradeRepository,
        logger
    ),
        ILongTradeService
{
    private readonly ITradeNotificationService _notificationService = notificationService;

    public Task<Trade> BuyAssets(
        Guid accountId,
        Guid instrumentId,
        decimal amount,
        int duration,
        decimal price
    ) =>
        CreateLongTransaction(accountId, instrumentId, amount, duration, price, ActionType.LongBuy);

    public Task<Trade> SellAssets(
        Guid accountId,
        Guid instrumentId,
        decimal amount,
        int duration,
        decimal price
    ) =>
        CreateLongTransaction(
            accountId,
            instrumentId,
            amount,
            duration,
            price,
            ActionType.LongSell
        );

    public async Task ProcessLongRunningTransactions()
    {
        _logger.LogInformation("Processing all long trades");

        await CloseOverdueTrades();

        var snapshot = await FetchMarketSnapshot();
        foreach (var openTrade in snapshot.OpenTrades)
        {
            _logger.LogDebug("Processing trade with ID [{tradeId}]", openTrade.Id);
            await ProcessOpenTrade(openTrade, snapshot);
        }
    }

    private async Task ProcessOpenTrade(Trade trade, MarketSnapshot snapshot)
    {
        var context = ResolveTradeContext(trade, snapshot);
        if (context is null)
        {
            _logger.LogWarning(
                "Skipping trade [{tradeId}]: missing instrument, price, or product data",
                trade.Id
            );
            return;
        }

        if (
            trade.Direction.Equals(
                nameof(ActionType.LongBuy),
                StringComparison.OrdinalIgnoreCase
            )
        )
        {
            await ProcessLongBuy(trade, context.Instrument, context.Price, context.Product);
        }
        else if (
            trade.Direction.Equals(
                nameof(ActionType.LongSell),
                StringComparison.OrdinalIgnoreCase
            )
        )
        {
            await ProcessLongSell(trade, context.Instrument, context.Price, context.Product);
        }
        else
        {
            await CloseTrade(
                trade,
                "This is not a long running transcation! Trade failed!",
                false
            );
        }
    }

    private async Task ProcessLongBuy(
        Trade trade,
        Instrument instrument,
        Price price,
        Product product
    )
    {
        if (!IsBuyEligible(trade, price))
            return;

        var balance = await GetBalanceOrThrow(trade.AccountId);
        if (!HasSufficientFunds(balance, trade.Quantity * trade.EntryPrice, product.Ppt))
        {
            await CloseTrade(trade, "Not enough money to buy stocks! Trade failed!", false);
            return;
        }

        await ExecuteLongBuy(trade, instrument, balance, product);
    }

    private async Task ExecuteLongBuy(
        Trade trade,
        Instrument instrument,
        Balance balance,
        Product product
    )
    {
        var cost = trade.Quantity * trade.EntryPrice;
        await UpdateBalance(balance, cost, product.Ppt, ActionType.LongBuy);
        await UpdateOwnedInstrument(trade.AccountId, instrument.Id, trade.Quantity);

        await CloseTrade(trade, "Long buy transaction finished!", true);
    }

    private async Task ProcessLongSell(
        Trade trade,
        Instrument instrument,
        Price price,
        Product product
    )
    {
        if (!IsSellEligible(trade, price))
            return;

        var ownedInstrument = await GetOwnedInstrumentOrThrow(trade.AccountId, instrument.Id);
        if (!HasSufficientStock(ownedInstrument, trade.Quantity))
        {
            await CloseTrade(trade, "Not enough stocks to sell! Trade failed!", false);
            return;
        }

        var balance = await GetBalanceOrThrow(trade.AccountId);
        await ExecuteLongSell(trade, ownedInstrument, balance, product);
    }

    private async Task ExecuteLongSell(
        Trade trade,
        OwnedInstrument ownedInstrument,
        Balance balance,
        Product product
    )
    {
        var income = trade.EntryPrice * trade.Quantity;
        await UpdateBalance(balance, income, product.Ppt, ActionType.LongSell);
        await UpdateOwnedInstrument(ownedInstrument, -trade.Quantity);

        await CloseTrade(trade, "Long sell transaction finished!", true);
    }

    private async Task<Trade> CreateLongTransaction(
        Guid accountId,
        Guid instrumentId,
        decimal amount,
        int duration,
        decimal price,
        ActionType type
    )
    {
        _logger.LogInformation(
            "Create long transaction with type [{type}], account ID: [{accountId}], instrument ID: [{instrumentId}], "
                + "amount [{amount}], duration [{duration}], price [{price}]",
            type,
            accountId,
            instrumentId,
            amount,
            duration,
            price
        );

        ValidateInput(amount, price, duration);
        await ValidateTransactionEntities(accountId, instrumentId);

        return await _tradeRepository.CreateTradeAsync(
            Trade.LongTrade(accountId, instrumentId, type, price, amount, duration)
        );
    }

    private async Task ValidateTransactionEntities(Guid accountId, Guid instrumentId)
    {
        await GetBalanceOrThrow(accountId);
        await GetInstrumentOrThrow(instrumentId);
    }

    private async Task CloseTrade(Trade trade, string status, bool transactionHappened)
    {
        _logger.LogDebug(
            "Closing trade with ID [{tradeId}], status [{status}], happened [{happened}]",
            trade.Id,
            status,
            transactionHappened
        );

        trade.Status = status;
        trade.TransactionHappened = transactionHappened;
        trade.TradeClosed = true;
        await _tradeRepository.UpdateTradeAsync(trade);

        _notificationService.OnTradeClosed(trade);
    }

    private async Task CloseOverdueTrades()
    {
        _logger.LogDebug("Closing all overdue trades");

        var expiredTrades = await _tradeRepository.GetExpiredTradesAsync();
        foreach (var trade in expiredTrades)
        {
            await CloseTrade(trade, "Time is up: trade failed", false);
        }
    }

    private async Task<MarketSnapshot> FetchMarketSnapshot() =>
        new(
            await _tradeRepository.GetOpenTradesAsync(),
            (await _instrumentRepository.GetAllInstrumentsAsync()).ToDictionary(x => x.Id, x => x),
            (await _priceService.GetLatestPrices()).ToDictionary(x => x.InstrumentId, x => x),
            (await _productRepository.GetProductsAsync()).ToDictionary(x => x.Id, x => x)
        );

    private static bool IsBuyEligible(Trade trade, Price price) =>
        trade.EntryPrice >= price.Low;

    private static bool IsSellEligible(Trade trade, Price price) =>
        trade.EntryPrice <= price.High;

    private static bool HasSufficientFunds(Balance balance, decimal cost, decimal ppt) =>
        cost + ppt <= balance.Value;

    private static bool HasSufficientStock(OwnedInstrument ownedInstrument, decimal quantity) =>
        ownedInstrument is not null && ownedInstrument.Quantity >= quantity;

    private static TradeContext? ResolveTradeContext(Trade trade, MarketSnapshot snapshot)
    {
        if (!snapshot.Instruments.TryGetValue(trade.InstrumentId, out var instrument))
            return null;
        if (!snapshot.Prices.TryGetValue(instrument.Id, out var price))
            return null;
        if (!snapshot.Products.TryGetValue(instrument.ProductId, out var product))
            return null;
        return new TradeContext(instrument, price, product);
    }

    private static bool ValidateInput(decimal amount, decimal price, int duration)
    {
        if (amount < 0)
        {
            throw new NegativeAmountException();
        }
        else if (price < 0)
        {
            throw new NegativeAmountException("Price cannot be lower that 0");
        }
        else if (duration < 0)
        {
            throw new NegativeAmountException("Duration cannot be lower that 0");
        }
        return true;
    }

    private record TradeContext(Instrument Instrument, Price Price, Product Product);
    private record MarketSnapshot(List<Trade> OpenTrades, Dictionary<Guid, Instrument> Instruments, Dictionary<Guid, Price> Prices, Dictionary<Guid, Product> Products);
}
