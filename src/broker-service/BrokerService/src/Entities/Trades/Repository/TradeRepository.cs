using EasyTrade.BrokerService.Connectors;
using EasyTrade.BrokerService.Helpers;
using EasyTrade.DbAdapter.Trade.Grpc;
using EasyTrade.DbAdapter.Common.Grpc;
using Google.Protobuf.WellKnownTypes;

namespace EasyTrade.BrokerService.Entities.Trades.Repository;

public class TradeRepository(IDbAdapterConnector connector)
    : DbAdapterRepository<TradeService.TradeServiceClient>(connector, channel => new(channel)), ITradeRepository
{
    public virtual async Task<Trade> CreateTradeAsync(Trade trade) =>
        await GrpcHelper.ExecuteAsync(
            async () => TradeMapper.FromProto(await GetClient().CreateTradeAsync(TradeMapper.CreateToProto(trade)))
        );

    public async Task<List<Trade>> GetOpenTradesAsync() =>
        await GrpcHelper.ExecuteAsync(
            async () => TradeMapper.FromProto((await GetClient().GetOpenTradesAsync(new Empty())).Trades)
        );

    public async Task<List<Trade>> GetExpiredTradesAsync() =>
        await GrpcHelper.ExecuteAsync(
            async () => TradeMapper.FromProto((await GetClient().GetExpiredTradesAsync(new Empty())).Trades)
        );

    public async Task<List<Trade>> GetAccountTradesAsync(Guid accountId, bool onlyOpen = false, bool onlyLong = false) =>
        await GrpcHelper.ExecuteAsync(
            async () => TradeMapper.FromProto((await GetClient().GetAccountTradesAsync(
                new GetAccountTradesRequest { AccountId = accountId.ToString(), OnlyOpen = onlyOpen, OnlyLong = onlyLong }
            )).Trades)
        );

    public async Task<Trade> UpdateTradeAsync(Trade trade) =>
        await GrpcHelper.ExecuteAsync(
            async () => TradeMapper.FromProto(await GetClient().UpdateTradeAsync(TradeMapper.UpdateToProto(trade)))
        );
}
