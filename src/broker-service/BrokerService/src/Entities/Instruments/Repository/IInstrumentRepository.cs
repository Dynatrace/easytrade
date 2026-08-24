namespace EasyTrade.BrokerService.Entities.Instruments.Repository;

public interface IInstrumentRepository
{
    Task<List<Instrument>> GetAllInstrumentsAsync();

    Task<Instrument?> GetInstrumentAsync(Guid instrumentId);

    Task<OwnedInstrument?> GetOwnedInstrumentAsync(Guid accountId, Guid instrumentId);

    Task<List<OwnedInstrument>> GetOwnedInstrumentsOfAccountAsync(Guid accountId);

    Task<OwnedInstrument> AddOwnedInstrumentAsync(OwnedInstrument ownedInstrument);

    Task<OwnedInstrument> UpdateOwnedInstrumentAsync(OwnedInstrument ownedInstrument);
}
