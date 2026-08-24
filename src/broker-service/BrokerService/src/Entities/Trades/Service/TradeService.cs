using EasyTrade.BrokerService.Entities.Balances.Repository;
using EasyTrade.BrokerService.Entities.Instruments;
using EasyTrade.BrokerService.Entities.Instruments.Repository;
using EasyTrade.BrokerService.Entities.Prices.ServiceConnector;
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

    public async Task<Trade> BuyAssets(Guid accountId, Guid instrumentId, decimal amount)
    {
        _logger.LogInformation(
            "Quick buy with account ID [{accountId}], instrument ID [{instrumentId}], amount [{amount}]",
            accountId,
            instrumentId,
            amount
        );

        ValidateInput(amount);
        var balance = await GetBalanceOrThrow(accountId);
        var instrument = await GetInstrumentOrThrow(instrumentId);
        var price = (await GetLastPriceOrThrow(instrumentId)).Open;
        var product = await GetProductOrThrow(instrument.ProductId);

        var cost = amount * price;
        var totalCost = cost + product.Ppt;
        if (totalCost > balance.Value)
        {
            throw new NotEnoughMoneyException(
                $"Not enough money to buy this asset (missing {totalCost - balance.Value})"
            );
        }

        var trade = await _tradeRepository.CreateTradeAsync(
            Trade.QuickTrade(accountId, instrumentId, ActionType.Buy, price, amount)
        );
        await UpdateBalance(balance, cost, product.Ppt, ActionType.Buy);
        await UpdateOwnedInstrument(accountId, instrumentId, amount);

        return trade;
    }

    public async Task<Trade> SellAssets(Guid accountId, Guid instrumentId, decimal amount)
    {
        _logger.LogInformation(
            "Quick sell with account ID [{accountId}], instrument ID [{instrumentId}], amount [{amount}]",
            accountId,
            instrumentId,
            amount
        );

        ValidateInput(amount);
        var balance = await GetBalanceOrThrow(accountId);
        var instrument = await GetInstrumentOrThrow(instrumentId);
        var price = (await GetLastPriceOrThrow(instrumentId)).Open;
        var product = await GetProductOrThrow(instrument.ProductId);
        var ownedInstrument = await _instrumentRepository.GetOwnedInstrumentAsync(
            accountId,
            instrumentId
        );

        if (ownedInstrument is null || ownedInstrument.Quantity < amount)
        {
            throw new NotEnoughAssetsException();
        }
        var income = price * amount;

        var trade = await _tradeRepository.CreateTradeAsync(
            Trade.QuickTrade(accountId, instrumentId, ActionType.Sell, price, amount)
        );
        await UpdateBalance(balance, income, product.Ppt, ActionType.Sell);
        await UpdateOwnedInstrument(ownedInstrument, -amount);

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
