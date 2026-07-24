package server

import (
	"context"

	pb "github.com/dynatrace/easytrade/dbadapter/proto"
	"github.com/dynatrace/easytrade/dbadapter/repository"
)

var _ pb.BalanceServiceServer = (*BalanceServer)(nil)

type BalanceServer struct {
	pb.UnimplementedBalanceServiceServer
	repo repository.BalanceRepository
}

func NewBalanceServer(repo repository.BalanceRepository) *BalanceServer {
	return &BalanceServer{repo: repo}
}

func (s *BalanceServer) CreateBalance(ctx context.Context, req *pb.CreateBalanceRequest) (*pb.BalanceMessage, error) {
	if err := validateUUID(req.AccountId); err != nil {
		return nil, err
	}
	return s.repo.Create(ctx, req)
}

func (s *BalanceServer) GetBalanceByAccountId(ctx context.Context, req *pb.GetBalanceRequest) (*pb.BalanceMessage, error) {
	if err := validateUUID(req.AccountId); err != nil {
		return nil, err
	}
	return fetchOrNotFound(s.repo.GetByAccountID(ctx, req.AccountId))
}

func (s *BalanceServer) UpdateBalance(ctx context.Context, req *pb.UpdateBalanceRequest) (*pb.BalanceMessage, error) {
	if err := validateUUID(req.AccountId); err != nil {
		return nil, err
	}
	existing, err := fetchOrNotFound(s.repo.GetByAccountID(ctx, req.AccountId))
	if err != nil {
		return nil, err
	}
	existing.Value = req.Value
	return fetchOrNotFound(s.repo.Update(ctx, existing))
}

func (s *BalanceServer) AddBalanceHistory(ctx context.Context, req *pb.AddBalanceHistoryRequest) (*pb.BalanceHistoryMessage, error) {
	if err := validateUUID(req.AccountId); err != nil {
		return nil, err
	}
	return s.repo.AddHistory(ctx, req)
}

func (s *BalanceServer) DeleteBalanceHistoryOlderThan(ctx context.Context, req *pb.DeleteBeforeRequest) (*pb.BatchResponse, error) {
	return batchResponse(s.repo.DeleteHistoryOlderThan(ctx, req.Before.AsTime()))
}
