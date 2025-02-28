namespace EasyTrade.BrokerService.Entities.Instruments.DTO;

public class InstrumentsResultDTO(IEnumerable<InstrumentDTO> results)
{
    public IEnumerable<InstrumentDTO> Results { get; set; } = results;
}
