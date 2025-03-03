using EasyTrade.BrokerService.Entities.Balances.Repository;
using EasyTrade.BrokerService.ExceptionHandling.Exceptions;
using EasyTrade.BrokerService.Helpers;

namespace EasyTrade.BrokerService.Entities.Balances.Service;

public class BalanceService(IBalanceRepository balanceRepository, ILogger<BalanceService> logger)
    : IBalanceService
{
    private readonly IBalanceRepository _balanceRepository = balanceRepository;
    private readonly ILogger _logger = logger;

    public Task<Balance> Deposit(int accountId, decimal amount) =>
        ModifyBalance(accountId, amount, ActionType.Deposit);

    public Task<Balance> Withdraw(int accountId, decimal amount) =>
        ModifyBalance(accountId, amount, ActionType.Withdraw);

    private async Task<Balance> ModifyBalance(int accountId, decimal amount, ActionType actionType)
    {
        _logger.LogInformation(
            "Modify balance with action type [{action}], amount [{amount}], account ID [{id}]",
            actionType,
            amount,
            accountId
        );

        var balance =
            await _balanceRepository.GetBalanceOfAccount(accountId)
            ?? throw new AccountNotFoundException(accountId);
        var balanceDifference = actionType is ActionType.Withdraw ? -amount : amount;
        var balanceHistory = new BalanceHistory(
            accountId,
            balance.Value,
            balanceDifference,
            actionType
        );

        switch (actionType)
        {
            case ActionType.Withdraw:
                balance.Withdraw(amount);
                break;
            case ActionType.Deposit:
                balance.Deposit(amount);
                break;
            default:
                throw new InvalidOperationException();
        }
        await _balanceRepository.BeginTransaction();
        _balanceRepository.UpdateBalance(balance);
        _balanceRepository.AddBalanceHistory(balanceHistory);
        try
        {
            await _balanceRepository.SaveChanges();
            await _balanceRepository.CommitTransaction();
        }
        catch (Exception e)
        {
            _logger.LogError("Error while saving changes: {Message}", e.Message);
            await _balanceRepository.RollbackTransaction();
            var exception = e.InnerException ?? e;
            throw new DbException(exception.Message, e);
        }

        _logger.LogDebug("Updated balance: {balance}", balance.ToJson());
        return balance;
    }

    public async Task<Balance> GetBalanceOfAccount(int accountId)
    {
        _logger.LogInformation("Get balance of account with ID [{id}]", accountId);

        var balance =
            await _balanceRepository.GetBalanceOfAccount(accountId)
            ?? throw new AccountNotFoundException(accountId);
        _logger.LogDebug("Found balance: {balance}", balance.ToJson());

        return balance;
    }
}
