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

        var openTrades = await _tradeRepository.GetOpenTradesAsync();
        var instruments = (await _instrumentRepository.GetAllInstrumentsAsync()).ToDictionary(
            x => x.Id,
            x => x
        );
        var prices = (await _priceService.GetLatestPrices()).ToDictionary(
            x => x.InstrumentId,
            x => x
        );
        var products = (await _productRepository.GetProductsAsync()).ToDictionary(
            x => x.Id,
            x => x
        );

        foreach (var openTrade in openTrades)
        {
            _logger.LogDebug("Processing trade with ID [{tradeId}]", openTrade.Id);

            var instrument = instruments[openTrade.InstrumentId];
            var price = prices[instrument.Id];
            var product = products[instrument.ProductId];
            if (
                openTrade.Direction.Equals(
                    nameof(ActionType.LongBuy),
                    StringComparison.OrdinalIgnoreCase
                )
            )
            {
                await ProcessLongBuy(openTrade, instrument, price, product);
            }
            else if (
                openTrade.Direction.Equals(
                    nameof(ActionType.LongSell),
                    StringComparison.OrdinalIgnoreCase
                )
            )
            {
                await ProcessLongSell(openTrade, instrument, price, product);
            }
            else
            {
                await CloseTrade(
                    openTrade,
                    "This is not a long running transcation! Trade failed!",
                    false
                );
            }
        }
    }

    private async Task ProcessLongBuy(
        Trade trade,
        Instrument instrument,
        Price price,
        Product product
    )
    {
        if (trade.EntryPrice < price.Low)
            return;

        var balance = (await _balanceRepository.GetBalanceOfAccountAsync(trade.AccountId))!;
        var cost = trade.Quantity * trade.EntryPrice;
        var totalCost = cost + product.Ppt;
        if (totalCost > balance.Value)
        {
            await CloseTrade(trade, "Not enough money to buy stocks! Trade failed!", false);
            return;
        }
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
        if (trade.EntryPrice > price.High)
            return;

        var ownedInstrument = await _instrumentRepository.GetOwnedInstrumentAsync(
            trade.AccountId,
            instrument.Id
        );
        if (ownedInstrument is null || ownedInstrument.Quantity < trade.Quantity)
        {
            await CloseTrade(trade, "Not enough stocks to sell! Trade failed!", false);
            return;
        }
        var balance = (await _balanceRepository.GetBalanceOfAccountAsync(trade.AccountId))!;
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
        if (await _balanceRepository.GetBalanceOfAccountAsync(accountId) is null)
        {
            throw new AccountNotFoundException(accountId);
        }
        if (await _instrumentRepository.GetInstrumentAsync(instrumentId) is null)
        {
            throw new InstrumentNotFoundException(instrumentId);
        }

        return await _tradeRepository.CreateTradeAsync(
            Trade.LongTrade(accountId, instrumentId, type, price, amount, duration)
        );
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
}
