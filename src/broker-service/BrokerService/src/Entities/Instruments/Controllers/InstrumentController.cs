using EasyTrade.BrokerService.Entities.Instruments.DTO;
using EasyTrade.BrokerService.Entities.Instruments.Service;
using EasyTrade.BrokerService.ExceptionHandling;
using Microsoft.AspNetCore.Mvc;

namespace EasyTrade.BrokerService.Entities.Instruments.Controllers;

[ApiController]
[Route("v1/instrument")]
[TypeFilter(typeof(BrokerExceptionFilter))]
public class InstrumentController(IInstrumentService instrumentService) : ControllerBase
{
    private readonly IInstrumentService _instrumentService = instrumentService;

    /// <summary>
    /// Get list of all available instruments
    /// </summary>
    /// <param name="accountId">Account ID</param>
    /// <returns>All instruments</returns>
    [ProducesResponseType(typeof(InstrumentsResultDTO), StatusCodes.Status200OK)]
    [HttpGet]
    public async Task<InstrumentsResultDTO> GetOwnedInstruments([FromQuery] int accountId = 0)
    {
        var instrument = await _instrumentService.GetInstruments(accountId);
        return new InstrumentsResultDTO(instrument);
    }
}
