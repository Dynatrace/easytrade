namespace EasyTrade.BrokerService.Entities.Prices.DTO;

public class PricesResultDto(IEnumerable<Price> results)
{
    public IEnumerable<Price> Results { get; set; } = results;
}
