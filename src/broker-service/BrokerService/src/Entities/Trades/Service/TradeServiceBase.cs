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

    protected async Task UpdateOwnedInstrument(int accountId, int instrumentId, decimal amount)
    {
        var ownedInstrument = await _instrumentRepository.GetOwnedInstrument(
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
            _instrumentRepository.AddOwnedInstrument(
                new OwnedInstrument(accountId, instrumentId, amount)
            );
        }
        else
        {
            UpdateOwnedInstrument(ownedInstrument, amount);
        }
    }

    protected void UpdateOwnedInstrument(OwnedInstrument ownedInstrument, decimal amount)
    {
        _logger.LogDebug(
            "Updating owned instrument with account ID [{accountId}], instrument ID [{instrumentId}], amount [{amount}]",
            ownedInstrument.AccountId,
            ownedInstrument.InstrumentId,
            amount
        );

        ownedInstrument.Quantity += amount;
        ownedInstrument.LastModificationDate = DateTimeOffset.Now;
        _instrumentRepository.UpdateOwnedInstrument(ownedInstrument);
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
        _balanceRepository.AddBalanceHistory(
            new BalanceHistory(balance.AccountId, balance.Value, income, actionType)
        );
        balance.Value += income;
        _balanceRepository.AddBalanceHistory(
            new BalanceHistory(balance.AccountId, balance.Value, -ppt, ActionType.TransactionFee)
        );
        balance.Value -= ppt;
        _balanceRepository.UpdateBalance(balance);
        await CollectFee(ppt);
    }

    private async Task CollectFee(decimal fee)
    {
        _logger.LogDebug("Collecting owner fee [{free}]", fee);

        var ownerBalance = (await _balanceRepository.GetBalanceOfAccount(Constants.OwnerId))!;
        _balanceRepository.AddBalanceHistory(
            new BalanceHistory(Constants.OwnerId, ownerBalance.Value, fee, ActionType.CollectFee)
        );
        ownerBalance.Value += fee;
        _balanceRepository.UpdateBalance(ownerBalance);
    }

    protected async Task SaveChangesOrRollback()
    {
        try
        {
            await _tradeRepository.SaveChanges();
            await _tradeRepository.CommitTransaction();
        }
        catch (Exception e)
        {
            _logger.LogError("Error while saving changes: {Message}", e.Message);
            await _tradeRepository.RollbackTransaction();
            var exception = e.InnerException ?? e;
            throw new DbException(exception.Message, e);
        }
    }
}
