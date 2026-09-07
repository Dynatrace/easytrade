using EasyTrade.BrokerService.Entities.Balances.Repository;
using EasyTrade.BrokerService.ExceptionHandling.Exceptions;
using EasyTrade.BrokerService.Helpers;

namespace EasyTrade.BrokerService.Entities.Balances.Service;

public class BalanceService(IBalanceRepository balanceRepository, ILogger<BalanceService> logger)
    : IBalanceService
{
    private readonly IBalanceRepository _balanceRepository = balanceRepository;
    private readonly ILogger _logger = logger;

    public Task<Balance> Deposit(Guid accountId, decimal amount) =>
        ModifyBalance(accountId, amount, ActionType.Deposit);

    public Task<Balance> Withdraw(Guid accountId, decimal amount) =>
        ModifyBalance(accountId, amount, ActionType.Withdraw);

    private async Task<Balance> ModifyBalance(Guid accountId, decimal amount, ActionType actionType)
    {
        _logger.LogInformation(
            "Modify balance with action type [{action}], amount [{amount}], account ID [{id}]",
            actionType,
            amount,
            accountId
        );

        var balance = await GetBalanceOrThrow(accountId);
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
        balance = await _balanceRepository.UpdateBalanceAsync(balance);
        await _balanceRepository.AddBalanceHistoryAsync(balanceHistory);

        _logger.LogDebug("Updated balance: {balance}", balance.ToJson());
        return balance;
    }

    public async Task<Balance> GetBalanceOfAccount(Guid accountId)
    {
        _logger.LogInformation("Get balance of account with ID [{id}]", accountId);

        var balance = await GetBalanceOrThrow(accountId);
        _logger.LogDebug("Found balance: {balance}", balance.ToJson());

        return balance;
    }

    private async Task<Balance> GetBalanceOrThrow(Guid accountId) =>
        await _balanceRepository.GetBalanceOfAccountAsync(accountId)
        ?? throw new BalanceNotFoundException(accountId);
}
