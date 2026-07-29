package server

import (
	"context"
	"errors"

	pb "github.com/dynatrace/easytrade/dbadapter/proto"
	"github.com/dynatrace/easytrade/dbadapter/repository"
	"google.golang.org/protobuf/types/known/emptypb"
)

var _ pb.CreditCardOrderServiceServer = (*CreditCardOrderServer)(nil)

type CreditCardOrderServer struct {
	pb.UnimplementedCreditCardOrderServiceServer
	repo repository.CreditCardOrderRepository
}

func NewCreditCardOrderServer(repo repository.CreditCardOrderRepository) *CreditCardOrderServer {
	return &CreditCardOrderServer{repo: repo}
}

func (s *CreditCardOrderServer) CreateCreditCardOrder(ctx context.Context, req *pb.CreateCreditCardOrderRequest) (*pb.CreditCardOrderMessage, error) {
	if err := validateUUID(req.AccountId); err != nil {
		return nil, err
	}
	return s.repo.Create(ctx, req)
}

func (s *CreditCardOrderServer) GetShippingAddressByOrderId(ctx context.Context, req *pb.GetShippingAddressRequest) (*pb.ShippingAddressMessage, error) {
	if err := validateUUID(req.OrderId); err != nil {
		return nil, err
	}
	return fetchOrNotFound(s.repo.GetShippingAddress(ctx, req.OrderId))
}

func (s *CreditCardOrderServer) GetStatusListByAccountId(ctx context.Context, req *pb.GetStatusListByAccountIdRequest) (*pb.OrderStatusListResponse, error) {
	if err := validateUUID(req.AccountId); err != nil {
		return nil, err
	}
	statuses, err := s.repo.GetStatusListByAccountID(ctx, req.AccountId)
	if errors.Is(err, repository.ErrNotFound) {
		return &pb.OrderStatusListResponse{}, nil
	}
	if err != nil {
		return nil, err
	}
	return &pb.OrderStatusListResponse{Statuses: statuses}, nil
}

func (s *CreditCardOrderServer) GetLastOrderStatusByAccountId(ctx context.Context, req *pb.GetLastOrderStatusByAccountIdRequest) (*pb.CreditCardOrderStatusMessage, error) {
	if err := validateUUID(req.AccountId); err != nil {
		return nil, err
	}
	return fetchOrNotFound(s.repo.GetLastStatusByAccountID(ctx, req.AccountId))
}

func (s *CreditCardOrderServer) GetOrdersToManufacture(ctx context.Context, _ *emptypb.Empty) (*pb.OrdersToManufactureResponse, error) {
	orders, err := s.repo.GetOrdersToManufacture(ctx)
	if err != nil {
		return nil, err
	}
	return &pb.OrdersToManufactureResponse{Orders: orders}, nil
}

func (s *CreditCardOrderServer) InsertNewStatus(ctx context.Context, req *pb.InsertNewStatusRequest) (*pb.CreditCardOrderStatusMessage, error) {
	if err := validateUUID(req.OrderId); err != nil {
		return nil, err
	}
	return s.repo.InsertStatus(ctx, req)
}

func (s *CreditCardOrderServer) InsertNewCreditCard(ctx context.Context, req *pb.InsertNewCreditCardRequest) (*pb.CreditCardMessage, error) {
	if err := validateUUID(req.OrderId); err != nil {
		return nil, err
	}
	return s.repo.InsertCard(ctx, req)
}

func (s *CreditCardOrderServer) UpdateOrderShippingId(ctx context.Context, req *pb.UpdateOrderShippingIdRequest) (*pb.CreditCardOrderMessage, error) {
	if err := validateUUID(req.OrderId); err != nil {
		return nil, err
	}
	existing, err := fetchOrNotFound(s.repo.GetByID(ctx, req.OrderId))
	if err != nil {
		return nil, err
	}
	existing.ShippingId = req.ShippingId
	return fetchOrNotFound(s.repo.Update(ctx, existing))
}

func (s *CreditCardOrderServer) DeleteOrdersByAccountId(ctx context.Context, req *pb.DeleteOrdersRequest) (*pb.BatchResponse, error) {
	if err := validateUUID(req.AccountId); err != nil {
		return nil, err
	}
	return batchResponse(s.repo.DeleteByAccountID(ctx, req.AccountId))
}
