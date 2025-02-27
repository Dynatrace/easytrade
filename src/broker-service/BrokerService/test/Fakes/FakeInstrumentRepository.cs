using EasyTrade.BrokerService.Entities.Accounts;
using EasyTrade.BrokerService.Entities.Instruments;
using EasyTrade.BrokerService.Entities.Instruments.Repository;
using EasyTrade.BrokerService.Test.Helpers;

namespace EasyTrade.BrokerService.Test.Fakes;

public class FakeInstrumentRepository : FakeTransactionalRepository, IInstrumentRepository
{
    private readonly List<Instrument> _instruments = new();
    private readonly List<OwnedInstrument> _ownedInstruments = new();

    public FakeInstrumentRepository(
        List<Instrument> instruments,
        List<OwnedInstrument> ownedInstruments
    ) => (_instruments, _ownedInstruments) = (instruments, ownedInstruments);

    public FakeInstrumentRepository() { }

    public FakeInstrumentRepository AddInstrument(Instrument instrument)
    {
        _instruments.Add(instrument);
        return this;
    }

    public FakeInstrumentRepository AddOwned(OwnedInstrument? ownedInstrument)
    {
        _ownedInstruments.Add(ownedInstrument!);
        return this;
    }

    public void DeleteOwnedInstrument(OwnedInstrument? ownedInstrument) =>
        _ownedInstruments.Remove(ownedInstrument!);

    public IQueryable<Instrument> GetAllInstruments() => _instruments.AsAsyncQueryable();

    public Task<Instrument?> GetInstrument(int instrumentId)
    {
        var instrument = _instruments.Find(x => x.Id == instrumentId);
        return Task.FromResult(instrument);
    }

    public Task<OwnedInstrument?> GetOwnedInstrument(int accountId, int instrumentId)
    {
        var ownedInstrument = _ownedInstruments.Find(x =>
            x.AccountId == accountId && x.InstrumentId == instrumentId
        );
        return Task.FromResult(ownedInstrument);
    }

    public IQueryable<OwnedInstrument> GetOwnedInstrumentsOfAccount(Account account) =>
        GetOwnedInstrumentsOfAccount(account.Id);

    public IQueryable<OwnedInstrument> GetOwnedInstrumentsOfAccount(int accountId) =>
        _ownedInstruments.Where(x => x.AccountId == accountId).AsAsyncQueryable();

    public void UpdateOwnedInstrument(OwnedInstrument? ownedInstrument)
    {
        var current = _ownedInstruments.Find(x => x.Id == ownedInstrument!.Id);
        current = ownedInstrument;
    }

    public void AddOwnedInstrument(OwnedInstrument? ownedInstrument) =>
        _ownedInstruments.Add(ownedInstrument!);
}
