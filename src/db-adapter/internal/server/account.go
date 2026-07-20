package server

import (
	"context"

	"github.com/dynatrace/easytrade/dbadapter/internal/models"
	pb "github.com/dynatrace/easytrade/dbadapter/proto"
	"google.golang.org/protobuf/types/known/emptypb"
	"google.golang.org/protobuf/types/known/timestamppb"
)

var _ pb.AccountServiceServer = (*AccountServer)(nil)

type AccountServer struct {
	pb.UnimplementedAccountServiceServer
	repo models.AccountRepository
}

func NewAccountServer(repo models.AccountRepository) *AccountServer {
	return &AccountServer{repo: repo}
}

func (s *AccountServer) CreateAccount(ctx context.Context, req *pb.CreateAccountRequest) (*pb.AccountMessage, error) {
	account, err := s.repo.Create(ctx, toAccountModel(req))
	return protoOrErr(account, err, toAccountProto)
}

func (s *AccountServer) GetAccountById(ctx context.Context, req *pb.GetAccountByIdRequest) (*pb.AccountMessage, error) {
	account, err := s.repo.GetByID(ctx, req.Id)
	return protoOrNotFound(account, err, toAccountProto)
}

func (s *AccountServer) GetAccountByUsername(ctx context.Context, req *pb.GetAccountByUsernameRequest) (*pb.AccountMessage, error) {
	account, err := s.repo.GetByUsername(ctx, req.Username)
	return protoOrNotFound(account, err, toAccountProto)
}

func (s *AccountServer) GetAccounts(ctx context.Context, _ *emptypb.Empty) (*pb.AccountsResponse, error) {
	accounts, err := s.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	return &pb.AccountsResponse{Accounts: mapSlice(accounts, toAccountProto)}, nil
}

func (s *AccountServer) DeleteAccountsOlderThan(ctx context.Context, req *pb.DeleteAccountsOlderThanRequest) (*pb.BatchResponse, error) {
	return batchResponse(s.repo.DeleteOlderThan(ctx, req.Before.AsTime(), req.Origin))
}

func toAccountModel(req *pb.CreateAccountRequest) *models.Account {
	return &models.Account{
		PackageID:             req.PackageId,
		FirstName:             req.FirstName,
		LastName:              req.LastName,
		Username:              req.Username,
		Email:                 req.Email,
		HashedPassword:        req.Password,
		Origin:                req.Origin,
		Address:               req.Address,
		CreationDate:          req.CreationDate.AsTime(),
		PackageActivationDate: req.PackageActivationDate.AsTime(),
		AccountActive:         req.AccountActive,
	}
}

func toAccountProto(a *models.Account) *pb.AccountMessage {
	return &pb.AccountMessage{
		Id:                    a.ID,
		PackageId:             a.PackageID,
		FirstName:             a.FirstName,
		LastName:              a.LastName,
		Username:              a.Username,
		Email:                 a.Email,
		HashedPassword:        a.HashedPassword,
		Origin:                a.Origin,
		CreationDate:          timestamppb.New(a.CreationDate),
		PackageActivationDate: timestamppb.New(a.PackageActivationDate),
		AccountActive:         a.AccountActive,
		Address:               a.Address,
	}
}
