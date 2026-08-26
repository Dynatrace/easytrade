using EasyTrade.BrokerService.Entities.Balances.DTO;
using EasyTrade.BrokerService.Entities.Balances.Service;
using EasyTrade.BrokerService.ExceptionHandling;
using Microsoft.AspNetCore.Mvc;

namespace EasyTrade.BrokerService.Entities.Balances.Controllers;

[ApiController]
[Route("v1/balance")]
[TypeFilter(typeof(BrokerExceptionFilter))]
public class BalanceController(IBalanceService balanceService) : ControllerBase
{
    private readonly IBalanceService _balanceService = balanceService;

    /// <summary>
    /// Deposit money to the account
    /// </summary>
    /// <param name="accountId">Account ID</param>
    /// <param name="depositMoneyDTO">Deposit information</param>
    /// <returns>Updated balance value</returns>
    [ProducesResponseType(typeof(Balance), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [HttpPost("{accountId:int}/deposit")]
    public async Task<Balance> DepositMoney(Guid accountId, DepositMoneyDTO depositMoneyDTO) => await _balanceService.Deposit(accountId, depositMoneyDTO.Amount);

    /// <summary>
    /// Withdraw money from the account
    /// </summary>
    /// <param name="accountId">Account ID</param>
    /// <param name="withdrawMoneyDTO">Withdrawal information</param>
    /// <returns>Updated balance value</returns>
    [ProducesResponseType(typeof(Balance), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [HttpPost("{accountId:int}/withdraw")]
    public async Task<Balance> WithdrawMoney(Guid accountId, WithdrawMoneyDTO withdrawMoneyDTO) => await _balanceService.Withdraw(accountId, withdrawMoneyDTO.Amount);

    /// <summary>
    /// Get current balance of an account
    /// </summary>
    /// <param name="accountId">Account ID</param>
    /// <returns>Balance</returns>
    [ProducesResponseType(typeof(Balance), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [HttpGet("{accountId:int}")]
    public async Task<Balance> GetBalanceOfAccount(Guid accountId) => await _balanceService.GetBalanceOfAccount(accountId);
}
