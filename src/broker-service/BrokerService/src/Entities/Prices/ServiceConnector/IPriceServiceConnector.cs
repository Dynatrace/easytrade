namespace EasyTrade.BrokerService.Entities.Prices.ServiceConnector;

public interface IPriceServiceConnector
{
    public Task<IEnumerable<Price>> GetPricesByInstrumentId(Guid id, int count);
    public Task<IEnumerable<Price>> GetLatestPrices();
    public Task<Price?> GetLastPriceByInstrumentId(Guid id);
    public Task<IReadOnlyDictionary<Guid, List<Price>>> GetAllPricesAscByTimestamp(DateTimeOffset since);
}
