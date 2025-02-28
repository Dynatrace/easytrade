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
using Microsoft.EntityFrameworkCore;

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
        int accountId,
        int instrumentId,
        decimal amount,
        int duration,
        decimal price
    ) =>
        CreateLongTransaction(accountId, instrumentId, amount, duration, price, ActionType.LongBuy);

    public Task<Trade> SellAssets(
        int accountId,
        int instrumentId,
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

        await _tradeRepository.BeginTransaction();
        await CloseOverdueTrades();
        await _tradeRepository.SaveChanges();

        var openTrades = await _tradeRepository
            .GetAllTrades()
            .Where(x => !x.TradeClosed)
            .ToListAsync();
        var instruments = await _instrumentRepository
            .GetAllInstruments()
            .ToDictionaryAsync(x => x.Id, x => x);
        var prices = (await _priceService.GetLatestPrices()).ToDictionary(
            x => x.InstrumentId,
            x => x
        );
        var products = await _productRepository.GetProducts().ToDictionaryAsync(x => x.Id, x => x);

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
                CloseTrade(
                    openTrade,
                    "This is not a long running transcation! Trade failed!",
                    false
                );
            }
            await _tradeRepository.SaveChanges();
        }

        await SaveChangesOrRollback();
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

        var balance = (await _balanceRepository.GetBalanceOfAccount(trade.AccountId))!;
        var cost = trade.Quantity * trade.EntryPrice;
        var totalCost = cost + product.Ppt;
        if (totalCost > balance.Value)
        {
            CloseTrade(trade, "Not enough money to buy stocks! Trade failed!", false);
            return;
        }
        await UpdateBalance(balance, cost, product.Ppt, ActionType.LongBuy);
        await UpdateOwnedInstrument(trade.AccountId, instrument.Id, trade.Quantity);

        CloseTrade(trade, "Long buy transaction finished!", true);
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

        var ownedInstrument = await _instrumentRepository.GetOwnedInstrument(
            trade.AccountId,
            instrument.Id
        );
        if (ownedInstrument is null || ownedInstrument.Quantity < trade.Quantity)
        {
            CloseTrade(trade, "Not enough stocks to sell! Trade failed!", false);
            return;
        }
        var balance = (await _balanceRepository.GetBalanceOfAccount(trade.AccountId))!;
        var income = trade.EntryPrice * trade.Quantity;
        await UpdateBalance(balance, income, product.Ppt, ActionType.LongSell);
        UpdateOwnedInstrument(ownedInstrument, -trade.Quantity);

        CloseTrade(trade, "Long sell transaction finished!", true);
    }

    private async Task<Trade> CreateLongTransaction(
        int accountId,
        int instrumentId,
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
        if (await _balanceRepository.GetBalanceOfAccount(accountId) is null)
        {
            throw new AccountNotFoundException(accountId);
        }
        if (await _instrumentRepository.GetInstrument(instrumentId) is null)
        {
            throw new InstrumentNotFoundException(instrumentId);
        }
        await _tradeRepository.BeginTransaction();

        var trade = Trade.LongTrade(accountId, instrumentId, type, price, amount, duration);
        _tradeRepository.AddTrade(trade);

        await SaveChangesOrRollback();

        return trade;
    }

    private void CloseTrade(Trade trade, string status, bool transactionHappened)
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
        _tradeRepository.UpdateTrade(trade);

        _notificationService.OnTradeClosed(trade);
    }

    private async Task CloseOverdueTrades()
    {
        _logger.LogDebug("Closing all overdue trades");

        await _tradeRepository
            .GetAllTrades()
            .Where(x => !x.TradeClosed && x.TimestampClose < DateTimeOffset.Now)
            .ForEachAsync(trade => CloseTrade(trade, "Time is up: trade failed", false));
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
