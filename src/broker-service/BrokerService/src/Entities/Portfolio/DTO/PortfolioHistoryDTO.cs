namespace EasyTrade.BrokerService.Entities.Portfolio.DTO;

public class PortfolioHistoryDTO(IEnumerable<PortfolioPointDTO> results)
{
    public IEnumerable<PortfolioPointDTO> Results { get; set; } = results;
}
