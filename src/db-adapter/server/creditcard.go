package server

import (
	"context"
	"errors"

	"github.com/dynatrace/easytrade/dbadapter/models"
	pb "github.com/dynatrace/easytrade/dbadapter/proto"
	"github.com/dynatrace/easytrade/dbadapter/repository"
	"google.golang.org/protobuf/types/known/emptypb"
	"google.golang.org/protobuf/types/known/timestamppb"
)

var _ pb.CreditCardOrderServiceServer = (*CreditCardOrderServer)(nil)

type CreditCardOrderServer struct {
	pb.UnimplementedCreditCardOrderServiceServer
	repo models.CreditCardOrderRepository
}

func NewCreditCardOrderServer(repo models.CreditCardOrderRepository) *CreditCardOrderServer {
	return &CreditCardOrderServer{repo: repo}
}

func (s *CreditCardOrderServer) CreateCreditCardOrder(ctx context.Context, req *pb.CreateCreditCardOrderRequest) (*pb.CreditCardOrderMessage, error) {
	order, err := s.repo.Create(ctx, toOrderModel(req))
	return protoOrErr(order, err, toOrderProto)
}

func (s *CreditCardOrderServer) GetShippingAddressByOrderId(ctx context.Context, req *pb.GetShippingAddressRequest) (*pb.ShippingAddressMessage, error) {
	order, err := s.repo.GetShippingAddress(ctx, req.OrderId)
	return protoOrNotFound(order, err, toShippingAddressProto)
}

func (s *CreditCardOrderServer) GetStatusListByAccountId(ctx context.Context, req *pb.GetStatusListByAccountIdRequest) (*pb.OrderStatusListResponse, error) {
	statuses, err := s.repo.GetStatusListByAccountID(ctx, req.AccountId)
	if errors.Is(err, repository.ErrNotFound) {
		return &pb.OrderStatusListResponse{}, nil
	}
	if err != nil {
		return nil, err
	}
	return &pb.OrderStatusListResponse{Statuses: mapSlice(statuses, toStatusProto)}, nil
}

func (s *CreditCardOrderServer) GetLastOrderStatusByAccountId(ctx context.Context, req *pb.GetLastOrderStatusByAccountIdRequest) (*pb.CreditCardOrderStatusMessage, error) {
	orderStatus, err := s.repo.GetLastStatusByAccountID(ctx, req.AccountId)
	return protoOrNotFound(orderStatus, err, toStatusProto)
}

func (s *CreditCardOrderServer) GetOrdersToManufacture(ctx context.Context, _ *emptypb.Empty) (*pb.OrdersToManufactureResponse, error) {
	orders, err := s.repo.GetOrdersToManufacture(ctx)
	if err != nil {
		return nil, err
	}
	return &pb.OrdersToManufactureResponse{Orders: mapSlice(orders, toManufactureDataProto)}, nil
}

func (s *CreditCardOrderServer) InsertNewStatus(ctx context.Context, req *pb.InsertNewStatusRequest) (*pb.CreditCardOrderStatusMessage, error) {
	orderStatus, err := s.repo.InsertStatus(ctx, toStatusModel(req))
	return protoOrErr(orderStatus, err, toStatusProto)
}

func (s *CreditCardOrderServer) InsertNewCreditCard(ctx context.Context, req *pb.InsertNewCreditCardRequest) (*pb.CreditCardMessage, error) {
	card, err := s.repo.InsertCard(ctx, toCardModel(req))
	return protoOrErr(card, err, toCardProto)
}

func (s *CreditCardOrderServer) UpdateOrderShippingId(ctx context.Context, req *pb.UpdateOrderShippingIdRequest) (*pb.CreditCardOrderMessage, error) {
	order, err := fetchOrNotFound(s.repo.GetShippingAddress(ctx, req.OrderId))
	if err != nil {
		return nil, err
	}
	order.ShippingID = req.ShippingId
	updated, err := s.repo.Update(ctx, order)
	return protoOrErr(updated, err, toOrderProto)
}

func (s *CreditCardOrderServer) DeleteOrdersByAccountId(ctx context.Context, req *pb.DeleteOrdersRequest) (*pb.BatchResponse, error) {
	return batchResponse(s.repo.DeleteByAccountID(ctx, req.AccountId))
}

func toCardModel(req *pb.InsertNewCreditCardRequest) *models.CreditCard {
	return &models.CreditCard{
		OrderID:   req.OrderId,
		Level:     req.CardLevel,
		Number:    req.CardNumber,
		CVS:       req.CardCvs,
		ValidDate: req.CardValidDate.AsTime(),
	}
}

func toCardProto(card *models.CreditCard) *pb.CreditCardMessage {
	return &pb.CreditCardMessage{
		OrderId:       card.OrderID,
		CardLevel:     card.Level,
		CardNumber:    card.Number,
		CardCvs:       card.CVS,
		CardValidDate: timestamppb.New(card.ValidDate),
	}
}

func toShippingAddressProto(order *models.CreditCardOrder) *pb.ShippingAddressMessage {
	return &pb.ShippingAddressMessage{
		ShippingAddress: order.ShippingAddress,
		Name:            order.Name,
		Email:           order.Email,
	}
}

func toManufactureDataProto(order *models.CreditCardOrder) *pb.CreditCardManufactureDataMessage {
	return &pb.CreditCardManufactureDataMessage{
		OrderId:   order.ID,
		Name:      order.Name,
		CardLevel: order.CardLevel,
	}
}

func toOrderModel(req *pb.CreateCreditCardOrderRequest) *models.CreditCardOrder {
	return &models.CreditCardOrder{
		ID:              req.Id,
		AccountID:       req.AccountId,
		Email:           req.Email,
		Name:            req.Name,
		ShippingAddress: req.ShippingAddress,
		CardLevel:       req.CardLevel,
	}
}

func toOrderProto(o *models.CreditCardOrder) *pb.CreditCardOrderMessage {
	return &pb.CreditCardOrderMessage{
		Id:              o.ID,
		AccountId:       o.AccountID,
		Email:           o.Email,
		Name:            o.Name,
		ShippingAddress: o.ShippingAddress,
		CardLevel:       o.CardLevel,
		ShippingId:      o.ShippingID,
	}
}

func toStatusModel(req *pb.InsertNewStatusRequest) *models.CreditCardOrderStatus {
	return &models.CreditCardOrderStatus{
		CreditCardOrderID: req.OrderId,
		Timestamp:         req.Timestamp.AsTime(),
		Status:            req.Status,
		Details:           req.Details,
	}
}

func toStatusProto(st *models.CreditCardOrderStatus) *pb.CreditCardOrderStatusMessage {
	return &pb.CreditCardOrderStatusMessage{
		Id:                st.ID,
		CreditCardOrderId: st.CreditCardOrderID,
		Timestamp:         timestamppb.New(st.Timestamp),
		Status:            st.Status,
		Details:           st.Details,
	}
}
