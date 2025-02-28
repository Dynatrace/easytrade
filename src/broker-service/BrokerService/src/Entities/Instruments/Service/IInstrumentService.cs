using EasyTrade.BrokerService.Entities.Instruments.DTO;

namespace EasyTrade.BrokerService.Entities.Instruments.Service;

public interface IInstrumentService
{
    public Task<IEnumerable<InstrumentDTO>> GetInstruments(int accountId);
}
