package server

import (
	"context"
	"time"

	pb "github.com/dynatrace/easytrade/dbadapter/proto"
	"github.com/dynatrace/easytrade/dbadapter/repository"
	"google.golang.org/protobuf/types/known/emptypb"
)

var _ pb.AccountServiceServer = (*AccountServer)(nil)

type AccountServer struct {
	pb.UnimplementedAccountServiceServer
	repo repository.AccountRepository
}

func NewAccountServer(repo repository.AccountRepository) *AccountServer {
	return &AccountServer{repo: repo}
}

func (s *AccountServer) CreateAccount(ctx context.Context, req *pb.CreateAccountRequest) (*pb.AccountMessage, error) {
	if err := validateUUID(req.PackageId); err != nil {
		return nil, err
	}
	return s.repo.Create(ctx, req)
}

func (s *AccountServer) GetAccountById(ctx context.Context, req *pb.GetAccountByIdRequest) (*pb.AccountMessage, error) {
	if err := validateUUID(req.Id); err != nil {
		return nil, err
	}
	return fetchOrNotFound(s.repo.GetByID(ctx, req.Id))
}

func (s *AccountServer) GetAccountByUsername(ctx context.Context, req *pb.GetAccountByUsernameRequest) (*pb.AccountMessage, error) {
	return fetchOrNotFound(s.repo.GetByUsername(ctx, req.Username))
}

func (s *AccountServer) GetAccounts(ctx context.Context, _ *emptypb.Empty) (*pb.AccountsResponse, error) {
	accounts, err := s.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	return &pb.AccountsResponse{Accounts: accounts}, nil
}

func (s *AccountServer) DeleteAccountsOlderThan(ctx context.Context, req *pb.DeleteAccountsOlderThanRequest) (*pb.BatchResponse, error) {
	var before *time.Time
	if req.Before != nil {
		t := req.Before.AsTime()
		before = &t
	}
	return batchResponse(s.repo.DeleteOlderThan(ctx, before, req.Origin))
}
