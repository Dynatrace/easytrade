using EasyTrade.BrokerService.Entities.Accounts;
using EasyTrade.BrokerService.Helpers;
using Microsoft.EntityFrameworkCore;

namespace EasyTrade.BrokerService.Entities.Instruments.Repository;

public class InstrumentRepository(BrokerDbContext dbContext)
    : TransactionalRepository(dbContext),
        IInstrumentRepository
{
    public IQueryable<Instrument> GetAllInstruments() => DbContext.Instruments.AsQueryable();

    public async Task<Instrument?> GetInstrument(int instrumentId) =>
        await DbContext.Instruments.Where(x => x!.Id == instrumentId).FirstOrDefaultAsync();

    public async Task<OwnedInstrument?> GetOwnedInstrument(int accountId, int instrumentId) =>
        await DbContext
            .OwnedInstruments.Where(x => x.AccountId == accountId && x.InstrumentId == instrumentId)
            .FirstOrDefaultAsync();

    public IQueryable<OwnedInstrument> GetOwnedInstrumentsOfAccount(Account account) =>
        GetOwnedInstrumentsOfAccount(account.Id);

    public IQueryable<OwnedInstrument> GetOwnedInstrumentsOfAccount(int accountId) =>
        DbContext.OwnedInstruments.Where(x => x!.AccountId == accountId).AsQueryable();

    public void AddOwnedInstrument(OwnedInstrument ownedInstrument) =>
        DbContext.OwnedInstruments.Add(ownedInstrument);

    public void UpdateOwnedInstrument(OwnedInstrument ownedInstrument) =>
        DbContext.OwnedInstruments.Update(ownedInstrument);

    public void DeleteOwnedInstrument(OwnedInstrument ownedInstrument) =>
        DbContext.OwnedInstruments.Remove(ownedInstrument);
}
