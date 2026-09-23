using EasyTrade.DbAdapter.Instrument.Grpc;
using Google.Protobuf.WellKnownTypes;

namespace EasyTrade.BrokerService.Entities.Instruments.Repository;

public static class InstrumentMapper
{
    public static Instrument FromProto(InstrumentMessage proto)
    {
        return new Instrument(
            id: Guid.Parse(proto.Id),
            productId: Guid.Parse(proto.ProductId),
            code: proto.Code,
            name: proto.Name,
            description: proto.Description
        );
    }

    public static List<Instrument> FromProto(IEnumerable<InstrumentMessage> proto) => [.. proto.Select(FromProto)];

    public static OwnedInstrument FromProto(OwnedInstrumentMessage proto)
    {
        return new OwnedInstrument(
            Guid.Parse(proto.AccountId),
            Guid.Parse(proto.InstrumentId),
            (decimal)proto.Quantity,
            proto.LastModificationDate.ToDateTimeOffset()
        )
        {
            Id = Guid.Parse(proto.Id)
        };
    }

    public static List<OwnedInstrument> FromProto(IEnumerable<OwnedInstrumentMessage> proto) => [.. proto.Select(FromProto)];

    public static AddOwnedInstrumentRequest AddToProto(OwnedInstrument ownedInstrument)
    {
        return new AddOwnedInstrumentRequest
        {
            AccountId = ownedInstrument.AccountId.ToString(),
            InstrumentId = ownedInstrument.InstrumentId.ToString(),
            Quantity = (double)ownedInstrument.Quantity,
            LastModificationDate = Timestamp.FromDateTimeOffset(
                ownedInstrument.LastModificationDate
            )
        };
    }

    public static UpdateOwnedInstrumentRequest UpdateToProto(OwnedInstrument ownedInstrument)
    {
        return new UpdateOwnedInstrumentRequest
        {
            Id = ownedInstrument.Id.ToString(),
            AccountId = ownedInstrument.AccountId.ToString(),
            InstrumentId = ownedInstrument.InstrumentId.ToString(),
            Quantity = (double)ownedInstrument.Quantity,
            LastModificationDate = Timestamp.FromDateTimeOffset(
                ownedInstrument.LastModificationDate
            )
        };
    }
}
