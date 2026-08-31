using EasyTrade.BrokerService.Entities.Portfolio.DTO;
using EasyTrade.BrokerService.Entities.Portfolio.Service;
using EasyTrade.BrokerService.ExceptionHandling;
using Microsoft.AspNetCore.Mvc;

namespace EasyTrade.BrokerService.Entities.Portfolio.Controllers;

[ApiController]
[Route("v1/portfolio")]
[TypeFilter(typeof(BrokerExceptionFilter))]
public class PortfolioController(IPortfolioService portfolioService) : ControllerBase
{
    private readonly IPortfolioService _portfolioService = portfolioService;

    /// <summary>
    /// Get portfolio value history for an account.
    /// </summary>
    /// <param name="accountId">Account ID</param>
    /// <param name="period">Time window: 1d (default), 7d, 30d</param>
    [ProducesResponseType(typeof(PortfolioHistoryDTO), StatusCodes.Status200OK)]
    [HttpGet("history/{accountId:guid}")]
    public async Task<PortfolioHistoryDTO> GetPortfolioHistory(
        Guid accountId,
        [FromQuery] string period = "1d"
    )
    {
        var results = await _portfolioService.GetPortfolioHistoryAsync(accountId, period);
        return new PortfolioHistoryDTO(results);
    }
}
