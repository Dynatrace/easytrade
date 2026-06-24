using EasyTrade.BrokerService.Entities.Balances.DTO;
using EasyTrade.BrokerService.Entities.Balances.Service;
using EasyTrade.BrokerService.ExceptionHandling;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Text.RegularExpressions;

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
    public async Task<Balance> DepositMoney(int accountId, DepositMoneyDTO depositMoneyDTO)
    {
        return await _balanceService.Deposit(accountId, depositMoneyDTO.Amount);
    }

    /// <summary>
    /// Deposit money to the account via Bitcoin
    /// </summary>
    /// <param name="accountId">Account ID</param>
    /// <param name="bitcoinDepositDTO">Bitcoin deposit information</param>
    /// <returns>Updated balance value (BTC converted to USD at current rate)</returns>
    [ProducesResponseType(typeof(Balance), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    [EnableRateLimiting("bitcoin-deposit")]
    [HttpPost("{accountId:int}/deposit/bitcoin")]
    public async Task<IActionResult> DepositBitcoin(int accountId, BitcoinDepositDTO bitcoinDepositDTO)
    {
        if (bitcoinDepositDTO.BtcAmount <= 0)
            return BadRequest(new ErrorResponse(400, "BTC amount must be greater than 0"));

        if (string.IsNullOrWhiteSpace(bitcoinDepositDTO.WalletAddress) ||
            !Regex.IsMatch(bitcoinDepositDTO.WalletAddress, @"^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$"))
            return BadRequest(new ErrorResponse(400, "Invalid Bitcoin wallet address"));

        var balance = await _balanceService.DepositBitcoin(accountId, bitcoinDepositDTO.BtcAmount, bitcoinDepositDTO.WalletAddress);
        return Ok(balance);
    }

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
    public async Task<Balance> WithdrawMoney(int accountId, WithdrawMoneyDTO withdrawMoneyDTO)
    {
        return await _balanceService.Withdraw(accountId, withdrawMoneyDTO.Amount);
    }

    /// <summary>
    /// Get current balance of an account
    /// </summary>
    /// <param name="accountId">Account ID</param>
    /// <returns>Balance</returns>
    [ProducesResponseType(typeof(Balance), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [HttpGet("{accountId:int}")]
    public async Task<Balance> GetBalanceOfAccount(int accountId)
    {
        return await _balanceService.GetBalanceOfAccount(accountId);
    }
}
