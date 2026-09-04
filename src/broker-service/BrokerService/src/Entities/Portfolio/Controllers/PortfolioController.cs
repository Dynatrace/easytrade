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
    [ProducesResponseType(typeof(PortfolioHistoryDTO), StatusCodes.Status200OK)]
    [HttpGet("history/{accountId:guid}")]
    [ResponseCache(Duration = 60, Location = ResponseCacheLocation.Client)]
    public async Task<PortfolioHistoryDTO> GetPortfolioHistory(Guid accountId)
    {
        var results = await portfolioService.GetPortfolioHistoryAsync(accountId);
        return new PortfolioHistoryDTO(results);
    }
}
