package server

import (
	"context"

	"github.com/dynatrace/easytrade/dbadapter/internal/models"
	pb "github.com/dynatrace/easytrade/dbadapter/proto"
	"google.golang.org/protobuf/types/known/timestamppb"
)

var _ pb.BalanceServiceServer = (*BalanceServer)(nil)

type BalanceServer struct {
	pb.UnimplementedBalanceServiceServer
	repo models.BalanceRepository
}

func NewBalanceServer(repo models.BalanceRepository) *BalanceServer {
	return &BalanceServer{repo: repo}
}

func (s *BalanceServer) CreateBalance(ctx context.Context, req *pb.CreateBalanceRequest) (*pb.BalanceMessage, error) {
	balance, err := s.repo.Create(ctx, toBalanceModel(req))
	return protoOrErr(balance, err, toBalanceProto)
}

func (s *BalanceServer) GetBalanceByAccountId(ctx context.Context, req *pb.GetBalanceRequest) (*pb.BalanceMessage, error) {
	balance, err := s.repo.GetByAccountID(ctx, req.AccountId)
	return protoOrNotFound(balance, err, toBalanceProto)
}

func (s *BalanceServer) UpdateBalance(ctx context.Context, req *pb.UpdateBalanceRequest) (*pb.BalanceMessage, error) {
	balance, err := fetchOrNotFound(s.repo.GetByAccountID(ctx, req.AccountId))
	if err != nil {
		return nil, err
	}
	balance.Value = req.Value
	updated, err := s.repo.Update(ctx, balance)
	return protoOrErr(updated, err, toBalanceProto)
}

func (s *BalanceServer) AddBalanceHistory(ctx context.Context, req *pb.AddBalanceHistoryRequest) (*pb.BalanceHistoryMessage, error) {
	history, err := s.repo.AddHistory(ctx, toBalanceHistoryModel(req))
	return protoOrErr(history, err, toBalanceHistoryProto)
}

func (s *BalanceServer) DeleteBalanceHistoryOlderThan(ctx context.Context, req *pb.DeleteBeforeRequest) (*pb.BatchResponse, error) {
	return batchResponse(s.repo.DeleteHistoryOlderThan(ctx, req.Before.AsTime()))
}

func toBalanceModel(req *pb.CreateBalanceRequest) *models.Balance {
	return &models.Balance{AccountID: req.AccountId, Value: req.Value}
}

func toBalanceProto(b *models.Balance) *pb.BalanceMessage {
	return &pb.BalanceMessage{AccountId: b.AccountID, Value: b.Value}
}

func toBalanceHistoryModel(req *pb.AddBalanceHistoryRequest) *models.BalanceHistory {
	return &models.BalanceHistory{
		AccountID:   req.AccountId,
		OldValue:    req.OldValue,
		ValueChange: req.ValueChange,
		ActionType:  req.ActionType,
		ActionDate:  req.ActionDate.AsTime(),
	}
}

func toBalanceHistoryProto(h *models.BalanceHistory) *pb.BalanceHistoryMessage {
	return &pb.BalanceHistoryMessage{
		Id:          h.ID,
		AccountId:   h.AccountID,
		OldValue:    h.OldValue,
		ValueChange: h.ValueChange,
		ActionType:  h.ActionType,
		ActionDate:  timestamppb.New(h.ActionDate),
	}
}
