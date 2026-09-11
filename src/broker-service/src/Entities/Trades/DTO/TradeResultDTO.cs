namespace EasyTrade.BrokerService.Entities.Trades.DTO;

public class TradeResultDTO
{
    public IEnumerable<TradeDTO> Results { get; set; }

    public TradeResultDTO(IEnumerable<Trade> trades)
    {
        var results = new List<TradeDTO>();
        trades.ToList().ForEach(x => results.Add(new TradeDTO(x)));
        Results = results;
    }
}
