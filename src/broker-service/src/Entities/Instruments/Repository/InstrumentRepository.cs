using EasyTrade.BrokerService.Connectors;
using EasyTrade.BrokerService.Helpers;
using EasyTrade.DbAdapter.Instrument.Grpc;
using Google.Protobuf.WellKnownTypes;

namespace EasyTrade.BrokerService.Entities.Instruments.Repository;

public class InstrumentRepository(IDbAdapterConnector connector)
    : DbAdapterRepository<InstrumentService.InstrumentServiceClient>(connector, channel => new(channel)), IInstrumentRepository
{
    public async Task<List<Instrument>> GetAllInstrumentsAsync() =>
        await GrpcHelper.ExecuteAsync(
            async () => InstrumentMapper.FromProto((await GetClient().GetAllInstrumentsAsync(new Empty())).Instruments)
        );

    public async Task<Instrument?> GetInstrumentAsync(Guid instrumentId) =>
        await GrpcHelper.ExecuteOrNullAsync(
            async () => InstrumentMapper.FromProto(await GetClient().GetInstrumentByIdAsync(new GetInstrumentRequest { Id = instrumentId.ToString() }))
        );

    public async Task<OwnedInstrument?> GetOwnedInstrumentAsync(Guid accountId, Guid instrumentId) =>
        await GrpcHelper.ExecuteOrNullAsync(
            async () => InstrumentMapper.FromProto(await GetClient().GetOwnedInstrumentAsync(new GetOwnedInstrumentRequest { AccountId = accountId.ToString(), InstrumentId = instrumentId.ToString() }))
        );

    public async Task<List<OwnedInstrument>> GetOwnedInstrumentsOfAccountAsync(Guid accountId) =>
        await GrpcHelper.ExecuteAsync(
            async () => InstrumentMapper.FromProto((await GetClient().GetOwnedInstrumentsAsync(new GetOwnedInstrumentsOfAccountRequest { AccountId = accountId.ToString() })).OwnedInstruments)
        );

    public async Task<OwnedInstrument> AddOwnedInstrumentAsync(OwnedInstrument ownedInstrument) =>
        await GrpcHelper.ExecuteAsync(
            async () => InstrumentMapper.FromProto(await GetClient().AddOwnedInstrumentAsync(InstrumentMapper.AddToProto(ownedInstrument)))
        );

    public async Task<OwnedInstrument> UpdateOwnedInstrumentAsync(OwnedInstrument ownedInstrument) =>
        await GrpcHelper.ExecuteAsync(
            async () => InstrumentMapper.FromProto(await GetClient().UpdateOwnedInstrumentAsync(InstrumentMapper.UpdateToProto(ownedInstrument)))
        );
}
