package server

import (
	"context"
	"time"

	"github.com/dynatrace/easytrade/dbadapter/models"
	pb "github.com/dynatrace/easytrade/dbadapter/proto"
	"google.golang.org/protobuf/types/known/emptypb"
	"google.golang.org/protobuf/types/known/timestamppb"
)

var _ pb.TradeServiceServer = (*TradeServer)(nil)

type TradeServer struct {
	pb.UnimplementedTradeServiceServer
	repo models.TradeRepository
}

func NewTradeServer(repo models.TradeRepository) *TradeServer {
	return &TradeServer{repo: repo}
}

func (s *TradeServer) CreateTrade(ctx context.Context, req *pb.CreateTradeRequest) (*pb.TradeMessage, error) {
	trade, err := s.repo.Create(ctx, toTradeModel(req))
	return protoOrErr(trade, err, toTradeProto)
}

func (s *TradeServer) UpdateTrade(ctx context.Context, req *pb.UpdateTradeRequest) (*pb.TradeMessage, error) {
	trade, err := fetchOrNotFound(s.repo.GetByID(ctx, req.Id))
	if err != nil {
		return nil, err
	}
	trade.TimestampClose = optionalTime(req.TimestampClose)
	trade.TradeClosed = req.TradeClosed
	trade.Status = req.Status
	updated, err := s.repo.Update(ctx, trade)
	return protoOrErr(updated, err, toTradeProto)
}

func (s *TradeServer) GetOpenTrades(ctx context.Context, _ *emptypb.Empty) (*pb.TradesResponse, error) {
	return s.tradesResponse(s.repo.GetOpen(ctx))
}

func (s *TradeServer) GetExpiredTrades(ctx context.Context, _ *emptypb.Empty) (*pb.TradesResponse, error) {
	return s.tradesResponse(s.repo.GetExpired(ctx))
}

func (s *TradeServer) GetAccountTrades(ctx context.Context, req *pb.GetAccountTradesRequest) (*pb.TradesResponse, error) {
	return s.tradesResponse(s.repo.GetByAccount(ctx, req.AccountId, models.TradeFilter{
		OnlyOpen: req.OnlyOpen,
		OnlyLong: req.OnlyLong,
	}))
}

func (s *TradeServer) DeleteTradesOlderThan(ctx context.Context, req *pb.DeleteBeforeRequest) (*pb.BatchResponse, error) {
	return batchResponse(s.repo.DeleteOlderThan(ctx, req.Before.AsTime()))
}

func (s *TradeServer) tradesResponse(trades []*models.Trade, err error) (*pb.TradesResponse, error) {
	if err != nil {
		return nil, err
	}
	return &pb.TradesResponse{Trades: mapSlice(trades, toTradeProto)}, nil
}

func optionalTime(ts *timestamppb.Timestamp) *time.Time {
	if ts == nil {
		return nil
	}
	t := ts.AsTime()
	return &t
}

func toTradeModel(req *pb.CreateTradeRequest) *models.Trade {
	return &models.Trade{
		AccountID:           req.AccountId,
		InstrumentID:        req.InstrumentId,
		Direction:           req.Direction,
		Quantity:            req.Quantity,
		EntryPrice:          req.EntryPrice,
		TimestampOpen:       req.TimestampOpen.AsTime(),
		TimestampClose:      optionalTime(req.TimestampClose),
		TradeClosed:         req.TradeClosed,
		TransactionHappened: req.TransactionHappened,
		Status:              req.Status,
	}
}

func toTradeProto(t *models.Trade) *pb.TradeMessage {
	msg := &pb.TradeMessage{
		Id:                  t.ID,
		AccountId:           t.AccountID,
		InstrumentId:        t.InstrumentID,
		Direction:           t.Direction,
		Quantity:            t.Quantity,
		EntryPrice:          t.EntryPrice,
		TimestampOpen:       timestamppb.New(t.TimestampOpen),
		TradeClosed:         t.TradeClosed,
		TransactionHappened: t.TransactionHappened,
		Status:              t.Status,
	}
	if t.TimestampClose != nil {
		msg.TimestampClose = timestamppb.New(*t.TimestampClose)
	}
	return msg
}
