using EasyTrade.BrokerService.Entities.Trades.Scheduler;
using Microsoft.AspNetCore.Mvc;

namespace EasyTrade.BrokerService.Entities.Trades.Controllers;

[ApiController]
[Route("v1/trade/scheduler")]
public class TradeSchedulerController(ILongTradeSchedulerService schedulerService) : ControllerBase
{
    private readonly ILongTradeSchedulerService _schedulerService = schedulerService;

    /// <summary>
    /// Start the long running transactions scheduler
    /// </summary>
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    [HttpGet("start")]
    public string Start() => _schedulerService.Start();

    /// <summary>
    /// Stop the long running transactions scheduler
    /// </summary>
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    [HttpGet("stop")]
    public string Stop() => _schedulerService.Stop();

    /// <summary>
    /// Get the status of the long running transactions scheduler
    /// </summary>
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    [HttpGet("status")]
    public string Status() => _schedulerService.Status();
}
