using EasyTrade.BrokerService.Entities.Trades.DTO;
using EasyTrade.BrokerService.Entities.Trades.Service;
using EasyTrade.BrokerService.ExceptionHandling;
using Microsoft.AspNetCore.Mvc;

namespace EasyTrade.BrokerService.Entities.Trades.Controllers;

[ApiController]
[Route("v1/trade")]
[TypeFilter(typeof(BrokerExceptionFilter))]
public class TradeController : ControllerBase
{
    private readonly ITradeService _tradeService;
    private readonly ILongTradeService _longTradeService;

    public TradeController(ITradeService tradeService, ILongTradeService longTradeService) =>
        (_tradeService, _longTradeService) = (tradeService, longTradeService);

    /// <summary>
    /// Quick buy
    /// </summary>
    /// <param name="tradeDTO">Buy data</param>
    [ProducesResponseType(typeof(TradeDTO), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [HttpPost("buy")]
    public async Task<TradeDTO> QuickBuyAssets(QuickTradeDTO tradeDTO)
    {
        var trade = await _tradeService.BuyAssets(
            tradeDTO.AccountId,
            tradeDTO.InstrumentId,
            tradeDTO.Amount
        );
        return new TradeDTO(trade);
    }

    /// <summary>
    /// Quick sell
    /// </summary>
    /// <param name="tradeDTO">Sell data</param>
    [ProducesResponseType(typeof(TradeDTO), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [HttpPost("sell")]
    public async Task<TradeDTO> QuickSellAssets(QuickTradeDTO tradeDTO)
    {
        var trade = await _tradeService.SellAssets(
            tradeDTO.AccountId,
            tradeDTO.InstrumentId,
            tradeDTO.Amount
        );
        return new TradeDTO(trade);
    }

    /// <summary>
    /// Long buy
    /// </summary>
    /// <param name="tradeDTO">Buy data</param>
    [ProducesResponseType(typeof(TradeDTO), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [HttpPost("long/buy")]
    public async Task<TradeDTO> LongBuyAssets(LongTradeDTO tradeDTO)
    {
        var trade = await _longTradeService.BuyAssets(
            tradeDTO.AccountId,
            tradeDTO.InstrumentId,
            tradeDTO.Amount,
            tradeDTO.Duration,
            tradeDTO.Price
        );
        return new TradeDTO(trade);
    }

    /// <summary>
    /// Long sell
    /// </summary>
    /// <param name="tradeDTO">Sell data</param>
    [ProducesResponseType(typeof(TradeDTO), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [HttpPost("long/sell")]
    public async Task<TradeDTO> LongSellAssets(LongTradeDTO tradeDTO)
    {
        var trade = await _longTradeService.SellAssets(
            tradeDTO.AccountId,
            tradeDTO.InstrumentId,
            tradeDTO.Amount,
            tradeDTO.Duration,
            tradeDTO.Price
        );
        return new TradeDTO(trade);
    }

    /// <summary>
    /// Process all the long running transactions
    /// </summary>
    [ProducesResponseType(StatusCodes.Status200OK)]
    [HttpPost("long/process")]
    public async Task ProcessLongTransactions()
    {
        await _longTradeService.ProcessLongRunningTransactions();
    }

    /// <summary>
    /// Get all trades for account
    /// </summary>
    /// <param name="accountId">Account ID</param>
    /// <param name="count">Items per page</param>
    /// <param name="page">Page</param>
    /// <param name="onlyOpen">Filter only open trades</param>
    /// <param name="onlyLong">Filter only long trades</param>
    [ProducesResponseType(typeof(TradeResultDTO), StatusCodes.Status200OK)]
    [HttpGet("{accountId:int}")]
    public async Task<TradeResultDTO> GetTradesOfAccount(
        int accountId,
        [FromQuery] int count = 10,
        [FromQuery] int page = 0,
        [FromQuery] bool onlyOpen = false,
        [FromQuery] bool onlyLong = false
    )
    {
        var trades = await _tradeService.GetTradesOfAccount(
            accountId,
            count,
            page,
            onlyOpen,
            onlyLong
        );
        return new TradeResultDTO(trades);
    }
}
