using EasyTrade.BrokerService.Entities.Accounts;
using EasyTrade.BrokerService.Helpers;

namespace EasyTrade.BrokerService.Entities.Instruments.Repository;

public interface IInstrumentRepository : ITransactionalRepository
{
    public IQueryable<Instrument> GetAllInstruments();

    public Task<Instrument?> GetInstrument(int instrumentId);

    public Task<OwnedInstrument?> GetOwnedInstrument(int accountId, int instrumentId);

    public IQueryable<OwnedInstrument> GetOwnedInstrumentsOfAccount(Account account);

    public IQueryable<OwnedInstrument> GetOwnedInstrumentsOfAccount(int accountId);

    public void AddOwnedInstrument(OwnedInstrument ownedInstrument);

    public void UpdateOwnedInstrument(OwnedInstrument ownedInstrument);

    public void DeleteOwnedInstrument(OwnedInstrument ownedInstrument);
}
