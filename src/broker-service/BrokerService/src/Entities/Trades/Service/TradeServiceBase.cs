using EasyTrade.BrokerService.Entities.Balances;
using EasyTrade.BrokerService.Entities.Balances.Repository;
using EasyTrade.BrokerService.Entities.Instruments;
using EasyTrade.BrokerService.Entities.Instruments.Repository;
using EasyTrade.BrokerService.Entities.Prices.ServiceConnector;
using EasyTrade.BrokerService.Entities.Products.Repository;
using EasyTrade.BrokerService.Entities.Trades.Repository;
using EasyTrade.BrokerService.ExceptionHandling.Exceptions;
using EasyTrade.BrokerService.Helpers;

namespace EasyTrade.BrokerService.Entities.Trades.Service;

public abstract class TradeServiceBase(
    IBalanceRepository balanceRepository,
    IInstrumentRepository instrumentRepository,
    IPriceServiceConnector priceService,
    IProductRepository productRepository,
    ITradeRepository tradeRepository,
    ILogger<TradeServiceBase> logger
)
{
    protected readonly IBalanceRepository _balanceRepository = balanceRepository;
    protected readonly IInstrumentRepository _instrumentRepository = instrumentRepository;
    protected readonly IPriceServiceConnector _priceService = priceService;
    protected readonly IProductRepository _productRepository = productRepository;
    protected readonly ITradeRepository _tradeRepository = tradeRepository;
    protected readonly ILogger _logger = logger;

    protected async Task UpdateOwnedInstrument(Guid accountId, Guid instrumentId, decimal amount)
    {
        var ownedInstrument = await _instrumentRepository.GetOwnedInstrumentAsync(
            accountId,
            instrumentId
        );
        if (ownedInstrument is null)
        {
            _logger.LogDebug(
                "Creating owned instrument with account ID [{accountId}], instrument ID [{instrumentId}], amount [{amount}]",
                accountId,
                instrumentId,
                amount
            );
            await _instrumentRepository.AddOwnedInstrumentAsync(
                new OwnedInstrument(accountId, instrumentId, amount)
            );
        }
        else
        {
            await UpdateOwnedInstrument(ownedInstrument, amount);
        }
    }

    protected async Task UpdateOwnedInstrument(OwnedInstrument ownedInstrument, decimal amount)
    {
        _logger.LogDebug(
            "Updating owned instrument with account ID [{accountId}], instrument ID [{instrumentId}], amount [{amount}]",
            ownedInstrument.AccountId,
            ownedInstrument.InstrumentId,
            amount
        );

        ownedInstrument.Quantity += amount;
        ownedInstrument.LastModificationDate = DateTimeOffset.Now;
        await _instrumentRepository.UpdateOwnedInstrumentAsync(ownedInstrument);
    }

    protected async Task UpdateBalance(
        Balance balance,
        decimal amount,
        decimal ppt,
        ActionType actionType
    )
    {
        _logger.LogDebug(
            "Updating balance with account ID [{accountId}], amount [{amount}], ppt [{ppt}], action type [{actionType}]",
            balance.AccountId,
            amount,
            ppt,
            actionType
        );

        var income = actionType is ActionType.Sell or ActionType.LongSell ? amount : -amount;
        await _balanceRepository.AddBalanceHistoryAsync(
            new BalanceHistory(balance.AccountId, balance.Value, income, actionType)
        );
        balance.Value += income;
        await _balanceRepository.AddBalanceHistoryAsync(
            new BalanceHistory(balance.AccountId, balance.Value, -ppt, ActionType.TransactionFee)
        );
        balance.Value -= ppt;
        await _balanceRepository.UpdateBalanceAsync(balance);
        await CollectFee(ppt);
    }

    private async Task CollectFee(decimal fee)
    {
        _logger.LogDebug("Collecting owner fee [{fee}]", fee);

        var ownerBalance = (await _balanceRepository.GetBalanceOfAccountAsync(Constants.OwnerId))!;
        await _balanceRepository.AddBalanceHistoryAsync(
            new BalanceHistory(Constants.OwnerId, ownerBalance.Value, fee, ActionType.CollectFee)
        );
        ownerBalance.Value += fee;
        await _balanceRepository.UpdateBalanceAsync(ownerBalance);
    }
}
