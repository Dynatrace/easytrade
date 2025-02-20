using EasyTrade.BrokerService.Entities.Balances.Repository;
using EasyTrade.BrokerService.Entities.Instruments.Repository;
using EasyTrade.BrokerService.Entities.Prices.ServiceConnector;
using EasyTrade.BrokerService.Entities.Products.Repository;
using EasyTrade.BrokerService.Entities.Trades.Repository;
using EasyTrade.BrokerService.ExceptionHandling.Exceptions;
using EasyTrade.BrokerService.Helpers;
using Microsoft.EntityFrameworkCore;

namespace EasyTrade.BrokerService.Entities.Trades.Service;

public class TradeService(
    IBalanceRepository balanceRepository,
    IInstrumentRepository instrumentRepository,
    IPriceServiceConnector priceService,
    IProductRepository productRepository,
    ITradeRepository tradeRepository,
    ILogger<TradeService> logger
)
    : TradeServiceBase(
        balanceRepository,
        instrumentRepository,
        priceService,
        productRepository,
        tradeRepository,
        logger
    ),
        ITradeService
{
    public async Task<IEnumerable<Trade>> GetTradesOfAccount(
        int accountId,
        int count,
        int page,
        bool onlyOpen = false,
        bool onlyLong = false
    )
    {
        _logger.LogInformation(
            "Getting trades with account ID [{accountId}], count [{count}], page [{page}], open [{open}], long [{long}]",
            accountId,
            count,
            page,
            onlyOpen,
            onlyLong
        );

        // Ordered by close timestamp, then by id
        return await _tradeRepository
            .GetAllTrades()
            .Where(x => x.AccountId == accountId)
            .Where(x => !onlyOpen || !x.TradeClosed)
            .Where(x =>
                !onlyLong
                || x.Direction.Equals(nameof(ActionType.LongBuy).ToLower())
                || x.Direction.Equals(nameof(ActionType.LongSell).ToLower())
            )
            .OrderByDescending(x => x.TimestampClose)
            .ThenByDescending(x => x.Id)
            .Skip(count * page)
            .Take(count)
            .ToListAsync();
    }

    public async Task<Trade> BuyAssets(int accountId, int instrumentId, decimal amount)
    {
        _logger.LogInformation(
            "Quick buy with account ID [{accountId}], instrument ID [{instrumentId}], amount [{amount}]",
            accountId,
            instrumentId,
            amount
        );

        ValidateInput(amount);
        var balance =
            await _balanceRepository.GetBalanceOfAccount(accountId)
            ?? throw new AccountNotFoundException(accountId);
        var instrument =
            await _instrumentRepository.GetInstrument(instrumentId)
            ?? throw new InstrumentNotFoundException(instrumentId);
        var price = (await _priceService.GetLastPriceByInstrumentId(instrumentId))!.Open;
        var product = (await _productRepository.GetProduct(instrument.ProductId))!;

        var cost = amount * price;
        var totalCost = cost + product.Ppt;
        if (totalCost > balance.Value)
        {
            throw new NotEnoughMoneyException(
                $"Not enough money to buy this asset (missing {totalCost - balance.Value})"
            );
        }
        await _tradeRepository.BeginTransaction();

        var trade = Trade.QuickTrade(accountId, instrumentId, ActionType.Buy, price, amount);
        _tradeRepository.AddTrade(trade);
        await UpdateBalance(balance, cost, product.Ppt, ActionType.Buy);
        await UpdateOwnedInstrument(accountId, instrumentId, amount);

        await SaveChangesOrRollback();

        return trade;
    }

    public async Task<Trade> SellAssets(int accountId, int instrumentId, decimal amount)
    {
        _logger.LogInformation(
            "Quick sell with account ID [{accountId}], instrument ID [{instrumentId}], amount [{amount}]",
            accountId,
            instrumentId,
            amount
        );

        ValidateInput(amount);
        var balance =
            await _balanceRepository.GetBalanceOfAccount(accountId)
            ?? throw new AccountNotFoundException(accountId);
        var instrument =
            await _instrumentRepository.GetInstrument(instrumentId)
            ?? throw new InstrumentNotFoundException(instrumentId);
        var price = (await _priceService.GetLastPriceByInstrumentId(instrumentId))!.Open;
        var product = (await _productRepository.GetProduct(instrument.ProductId))!;
        var ownedInstrument = await _instrumentRepository.GetOwnedInstrument(
            accountId,
            instrumentId
        );

        if (ownedInstrument is null || ownedInstrument.Quantity < amount)
        {
            throw new NotEnoughAssetsException();
        }
        var income = price * amount;
        await _tradeRepository.BeginTransaction();

        var trade = Trade.QuickTrade(accountId, instrumentId, ActionType.Sell, price, amount);
        _tradeRepository.AddTrade(trade);
        await UpdateBalance(balance, income, product.Ppt, ActionType.Sell);
        UpdateOwnedInstrument(ownedInstrument, -amount);

        await SaveChangesOrRollback();

        return trade;
    }

    private static bool ValidateInput(decimal amount)
    {
        if (amount < 0)
        {
            throw new NegativeAmountException();
        }
        return true;
    }
}
