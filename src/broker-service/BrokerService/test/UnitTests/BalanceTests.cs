using EasyTrade.BrokerService.Entities.Balances;
using EasyTrade.BrokerService.Entities.Balances.Service;
using EasyTrade.BrokerService.ExceptionHandling.Exceptions;
using EasyTrade.BrokerService.Helpers;
using EasyTrade.BrokerService.Test.Fakes;
using Microsoft.Extensions.Logging;

namespace EasyTrade.BrokerService.Test.UnitTests;

public class BalanceTests
{
    private FakeBalanceRepository? _balanceRepository;

    [Fact]
    public async Task GetBalance_WithValidAccount_ShouldReturnBalance()
    {
        // Arrange
        const decimal startingValue = 344.976M;
        const int id = 21;

        Balance[] balances = { new Balance(id, startingValue) };
        var balanceService = BuildFakeBalanceService(balances, Array.Empty<BalanceHistory>());

        // Act
        var balance = await balanceService.GetBalanceOfAccount(id);

        // Assert
        Assert.Equal(id, balance.AccountId);
        Assert.Equal(startingValue, balance.Value);
    }

    [Fact]
    public async Task GetBalance_InvalidAccountId_ShouldThrowException()
    {
        // Arrange
        const int id = 213;

        var balanceService = BuildFakeBalanceService(
            Array.Empty<Balance>(),
            Array.Empty<BalanceHistory>()
        );

        // Act & Assert
        await Assert.ThrowsAsync<AccountNotFoundException>(
            async () => await balanceService.GetBalanceOfAccount(id)
        );
    }

    [Fact]
    public async Task Deposit_WithValidInput_ShouldUpdateBalance()
    {
        // Arrange
        const decimal startingValue = 100;
        const decimal amount = 100.5M;
        const int id = 10;

        Balance[] balances = { new Balance(id, startingValue) };
        var balanceService = BuildFakeBalanceService(balances, Array.Empty<BalanceHistory>());

        // Act
        await balanceService.Deposit(id, amount);
        var balance = await balanceService.GetBalanceOfAccount(id);

        // Assert
        var balanceHistory = _balanceRepository!.GetBalanceHistories().First();

        Assert.Equal(startingValue + amount, balance.Value);

        Assert.Equal(id, balanceHistory.AccountId);
        Assert.Equal(startingValue, balanceHistory.OldValue);
        Assert.Equal(amount, balanceHistory.ValueChange);
        Assert.Equal(nameof(ActionType.Deposit).ToLower(), balanceHistory.ActionType);
    }

    [Fact]
    public async Task Withdraw_WithValidInput_ShouldUpdateBalance()
    {
        // Arrange
        const decimal startingValue = 12;
        const decimal amount = 5.52M;
        const int id = 122;

        Balance[] balances = { new Balance(id, startingValue) };
        var balanceService = BuildFakeBalanceService(balances, Array.Empty<BalanceHistory>());

        // Act
        await balanceService.Withdraw(id, amount);
        var balance = await balanceService.GetBalanceOfAccount(id);

        // Assert
        var balanceHistory = _balanceRepository!.GetBalanceHistories().First();

        Assert.Equal(startingValue - amount, balance.Value);

        Assert.Equal(id, balanceHistory.AccountId);
        Assert.Equal(startingValue, balanceHistory.OldValue);
        Assert.Equal(-amount, balanceHistory.ValueChange);
        Assert.Equal(nameof(ActionType.Withdraw).ToLower(), balanceHistory.ActionType);
    }

    [Fact]
    public async Task Withdraw_NotEnoughMoney_ShouldThrowException()
    {
        // Arrange
        const decimal startingValue = 12.3M;
        const decimal amount = 13.3M;
        const int id = 11;

        Balance[] balances = { new Balance(id, startingValue) };
        var balanceService = BuildFakeBalanceService(balances, Array.Empty<BalanceHistory>());

        // Act & Assert
        await Assert.ThrowsAsync<NotEnoughMoneyException>(
            async () => await balanceService.Withdraw(id, amount)
        );
    }

    [Fact]
    public async Task DepositWithdraw_WithInvalidAccount_ShouldThrowException()
    {
        // Arrange
        const decimal amount = 100;
        const int id = 10;

        var balanceService = BuildFakeBalanceService(
            Array.Empty<Balance>(),
            Array.Empty<BalanceHistory>()
        );

        // Act & Assert
        await Assert.ThrowsAsync<AccountNotFoundException>(
            async () => await balanceService.Deposit(id, amount)
        );
        await Assert.ThrowsAsync<AccountNotFoundException>(
            async () => await balanceService.Withdraw(id, amount)
        );
    }

    [Fact]
    public async Task DepositWithdraw_WithNegativeAmount_ShouldThrowException()
    {
        // Arrange
        const decimal startingValue = 0;
        const decimal amount = -0.1M;
        const int id = 10;

        Balance[] balances = { new Balance(id, startingValue) };
        var balanceService = BuildFakeBalanceService(balances, Array.Empty<BalanceHistory>());

        // Act & Assert
        await Assert.ThrowsAsync<NegativeAmountException>(
            async () => await balanceService.Deposit(id, amount)
        );
        await Assert.ThrowsAsync<NegativeAmountException>(
            async () => await balanceService.Withdraw(id, amount)
        );
    }

    private BalanceService BuildFakeBalanceService(
        Balance[] balances,
        BalanceHistory[] balanceHistories
    )
    {
        _balanceRepository = new FakeBalanceRepository(
            balances.ToList(),
            balanceHistories.ToList()
        );
        var logger = new Mock<ILogger<BalanceService>>().Object;
        return new BalanceService(_balanceRepository, logger);
    }
}
