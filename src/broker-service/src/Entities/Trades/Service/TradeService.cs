using EasyTrade.BrokerService.Entities.Balances;
using EasyTrade.BrokerService.Entities.Balances.Repository;
using EasyTrade.BrokerService.Entities.Instruments.Repository;
using EasyTrade.BrokerService.Entities.Prices.ServiceConnector;
using EasyTrade.BrokerService.Entities.Products;
using EasyTrade.BrokerService.Entities.Products.Repository;
using EasyTrade.BrokerService.Entities.Trades.Repository;
using EasyTrade.BrokerService.ExceptionHandling.Exceptions;
using EasyTrade.BrokerService.Helpers;

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
        Guid accountId,
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

        var trades = await _tradeRepository.GetAccountTradesAsync(accountId, onlyOpen, onlyLong);
        return [.. trades
            .OrderByDescending(x => x.TimestampClose)
            .ThenByDescending(x => x.Id)
            .Skip(count * page)
            .Take(count)];
    }

    public Task<Trade> BuyAssets(Guid accountId, Guid instrumentId, decimal amount) =>
        ProcessQuickTrade(accountId, instrumentId, amount, "buy", ExecuteQuickBuy);

    public Task<Trade> SellAssets(Guid accountId, Guid instrumentId, decimal amount) =>
        ProcessQuickTrade(accountId, instrumentId, amount, "sell", ExecuteQuickSell);

    private async Task<Trade> ProcessQuickTrade(
        Guid accountId,
        Guid instrumentId,
        decimal amount,
        string action,
        Func<Guid, Guid, decimal, QuickTradeContext, Task<Trade>> execute
    )
    {
        _logger.LogInformation(
            "Quick {action} with account ID [{accountId}], instrument ID [{instrumentId}], amount [{amount}]",
            action,
            accountId,
            instrumentId,
            amount
        );
        ValidateInput(amount);
        var ctx = await FetchQuickTradeContext(accountId, instrumentId);
        return await execute(accountId, instrumentId, amount, ctx);
    }

    private async Task<Trade> ExecuteQuickBuy(
        Guid accountId,
        Guid instrumentId,
        decimal amount,
        QuickTradeContext ctx
    )
    {
        var cost = amount * ctx.OpenPrice;
        if (cost + ctx.Product.Ppt > ctx.Balance.Value)
            throw new NotEnoughMoneyException(
                $"Not enough money to buy this asset (missing {cost + ctx.Product.Ppt - ctx.Balance.Value})"
            );

        var trade = await _tradeRepository.CreateTradeAsync(
            Trade.QuickTrade(accountId, instrumentId, ActionType.Buy, ctx.OpenPrice, amount)
        );
        await UpdateBalance(ctx.Balance, cost, ctx.Product.Ppt, ActionType.Buy);
        await UpdateOwnedInstrument(accountId, instrumentId, amount);
        return trade;
    }

    private async Task<Trade> ExecuteQuickSell(
        Guid accountId,
        Guid instrumentId,
        decimal amount,
        QuickTradeContext ctx
    )
    {
        var ownedInstrument = await GetOwnedInstrumentOrThrow(accountId, instrumentId);

        if (ownedInstrument.Quantity < amount)
            throw new NotEnoughAssetsException();

        var income = ctx.OpenPrice * amount;
        var trade = await _tradeRepository.CreateTradeAsync(
            Trade.QuickTrade(accountId, instrumentId, ActionType.Sell, ctx.OpenPrice, amount)
        );
        await UpdateBalance(ctx.Balance, income, ctx.Product.Ppt, ActionType.Sell);
        await UpdateOwnedInstrument(ownedInstrument, -amount);
        return trade;
    }

    private async Task<QuickTradeContext> FetchQuickTradeContext(Guid accountId, Guid instrumentId)
    {
        var balance = await GetBalanceOrThrow(accountId);
        var instrument = await GetInstrumentOrThrow(instrumentId);
        var openPrice = (await GetLastPriceOrThrow(instrumentId)).Open;
        var product = await GetProductOrThrow(instrument.ProductId);
        return new(balance, openPrice, product);
    }

    private static bool ValidateInput(decimal amount)
    {
        if (amount < 0)
        {
            throw new NegativeAmountException();
        }
        return true;
    }

    private record QuickTradeContext(Balance Balance, decimal OpenPrice, Product Product);
}
