package server

import (
	"context"

	pb "github.com/dynatrace/easytrade/dbadapter/proto"
	"github.com/dynatrace/easytrade/dbadapter/repository"
	"google.golang.org/protobuf/types/known/emptypb"
)

var _ pb.TradeServiceServer = (*TradeServer)(nil)

type TradeServer struct {
	pb.UnimplementedTradeServiceServer
	repo repository.TradeRepository
}

func NewTradeServer(repo repository.TradeRepository) *TradeServer {
	return &TradeServer{repo: repo}
}

func (s *TradeServer) CreateTrade(ctx context.Context, req *pb.CreateTradeRequest) (*pb.TradeMessage, error) {
	if err := validateUUID(req.AccountId); err != nil {
		return nil, err
	}
	if err := validateUUID(req.InstrumentId); err != nil {
		return nil, err
	}
	return s.repo.Create(ctx, req)
}

func (s *TradeServer) UpdateTrade(ctx context.Context, req *pb.UpdateTradeRequest) (*pb.TradeMessage, error) {
	if err := validateUUID(req.Id); err != nil {
		return nil, err
	}
	existing, err := fetchOrNotFound(s.repo.GetByID(ctx, req.Id))
	if err != nil {
		return nil, err
	}
	existing.TimestampClose = req.TimestampClose
	existing.TradeClosed = req.TradeClosed
	existing.Status = req.Status
	return fetchOrNotFound(s.repo.Update(ctx, existing))
}

func (s *TradeServer) GetOpenTrades(ctx context.Context, _ *emptypb.Empty) (*pb.TradesResponse, error) {
	return s.tradesResponse(s.repo.GetOpen(ctx))
}

func (s *TradeServer) GetExpiredTrades(ctx context.Context, _ *emptypb.Empty) (*pb.TradesResponse, error) {
	return s.tradesResponse(s.repo.GetExpired(ctx))
}

func (s *TradeServer) GetAccountTrades(ctx context.Context, req *pb.GetAccountTradesRequest) (*pb.TradesResponse, error) {
	if err := validateUUID(req.AccountId); err != nil {
		return nil, err
	}
	return s.tradesResponse(s.repo.GetByAccount(ctx, req.AccountId, req.OnlyOpen, req.OnlyLong))
}

func (s *TradeServer) DeleteTradesOlderThan(ctx context.Context, req *pb.DeleteBeforeRequest) (*pb.BatchResponse, error) {
	return batchResponse(s.repo.DeleteOlderThan(ctx, req.Before.AsTime()))
}

func (s *TradeServer) tradesResponse(trades []*pb.TradeMessage, err error) (*pb.TradesResponse, error) {
	if err != nil {
		return nil, err
	}
	return &pb.TradesResponse{Trades: trades}, nil
}
