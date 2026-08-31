using EasyTrade.BrokerService.Entities.Portfolio.DTO;

namespace EasyTrade.BrokerService.Entities.Portfolio.Service;

public interface IPortfolioService
{
    Task<IEnumerable<PortfolioPointDTO>> GetPortfolioHistoryAsync(Guid accountId, string period);
}
