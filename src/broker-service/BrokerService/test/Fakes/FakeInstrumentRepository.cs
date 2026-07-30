using EasyTrade.BrokerService.Entities.Instruments;
using EasyTrade.BrokerService.Entities.Instruments.Repository;

namespace EasyTrade.BrokerService.Test.Fakes;

public class FakeInstrumentRepository : IInstrumentRepository
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

    public Task<List<Instrument>> GetAllInstrumentsAsync() =>
        Task.FromResult(_instruments.ToList());

    public Task<Instrument?> GetInstrumentAsync(Guid instrumentId)
    {
        var instrument = _instruments.Find(x => x.Id == instrumentId);
        return Task.FromResult(instrument);
    }

    public Task<OwnedInstrument?> GetOwnedInstrumentAsync(Guid accountId, Guid instrumentId)
    {
        var ownedInstrument = _ownedInstruments.Find(x =>
            x.AccountId == accountId && x.InstrumentId == instrumentId
        );
        return Task.FromResult(ownedInstrument);
    }

    public List<OwnedInstrument> GetOwnedInstrumentsOfAccount(Guid accountId) =>
        _ownedInstruments.Where(x => x.AccountId == accountId).ToList();

    public Task<List<OwnedInstrument>> GetOwnedInstrumentsOfAccountAsync(Guid accountId) =>
        Task.FromResult(_ownedInstruments.Where(x => x.AccountId == accountId).ToList());

    public Task<OwnedInstrument> AddOwnedInstrumentAsync(OwnedInstrument ownedInstrument)
    {
        _ownedInstruments.Add(ownedInstrument);
        return Task.FromResult(ownedInstrument);
    }

    public Task<OwnedInstrument> UpdateOwnedInstrumentAsync(OwnedInstrument ownedInstrument)
    {
        var index = _ownedInstruments.FindIndex(x =>
            x.AccountId == ownedInstrument.AccountId && x.InstrumentId == ownedInstrument.InstrumentId);
        if (index >= 0)
            _ownedInstruments[index] = ownedInstrument;
        return Task.FromResult(ownedInstrument);
    }
}
