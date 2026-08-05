package account

import (
	"context"
	"dynatrace.com/easytrade/user-service/dbadapter/proto"
	"github.com/google/uuid"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/emptypb"
)

type fakeAccountServiceClient struct {
	accounts map[string]*proto.AccountMessage
}

func newFakeAccountServiceClient() *fakeAccountServiceClient {
	return &fakeAccountServiceClient{
		accounts: make(map[string]*proto.AccountMessage),
	}
}

func (f *fakeAccountServiceClient) CreateAccount(_ context.Context, in *proto.CreateAccountRequest, _ ...grpc.CallOption) (*proto.AccountMessage, error) {
	id := uuid.New().String()

	acc := &proto.AccountMessage{
		Id:                    id,
		PackageId:             in.PackageId,
		FirstName:             in.FirstName,
		LastName:              in.LastName,
		Username:              in.Username,
		Email:                 in.Email,
		HashedPassword:        in.Password, // caller already hashed it
		Origin:                in.Origin,
		CreationDate:          in.CreationDate,
		PackageActivationDate: in.PackageActivationDate,
		AccountActive:         in.AccountActive,
		Address:               in.Address,
	}
	f.accounts[id] = acc
	return acc, nil
}

func (f *fakeAccountServiceClient) GetAccountById(_ context.Context, in *proto.GetAccountByIdRequest, _ ...grpc.CallOption) (*proto.AccountMessage, error) {
	acc, ok := f.accounts[in.Id]
	if !ok {
		return nil, status.Error(codes.NotFound, "account not found")
	}
	return acc, nil
}

func (f *fakeAccountServiceClient) GetAccountByUsername(_ context.Context, in *proto.GetAccountByUsernameRequest, _ ...grpc.CallOption) (*proto.AccountMessage, error) {
	for _, acc := range f.accounts {
		if acc.Username == in.Username {
			return acc, nil
		}
	}
	return nil, status.Error(codes.NotFound, "account not found")
}

func (f *fakeAccountServiceClient) GetAccounts(_ context.Context, _ *emptypb.Empty, _ ...grpc.CallOption) (*proto.AccountsResponse, error) {
	accounts := make([]*proto.AccountMessage, 0, len(f.accounts))
	for _, acc := range f.accounts {
		accounts = append(accounts, acc)
	}
	return &proto.AccountsResponse{Accounts: accounts}, nil
}
