package sql

import (
	"context"
	"errors"
	"time"

	pb "github.com/dynatrace/easytrade/dbadapter/proto"
	"github.com/dynatrace/easytrade/dbadapter/repository"
	"github.com/google/uuid"
	"google.golang.org/protobuf/types/known/timestamppb"
	"gorm.io/gorm"
)

type CreditCardOrder struct {
	Id              *uuid.UUID `gorm:"primaryKey;default:(-)"`
	AccountId       *uuid.UUID
	Email           string
	Name            string
	ShippingAddress string
	CardLevel       string
	ShippingId      *string
}

type CreditCard struct {
	Id                *uuid.UUID `gorm:"primaryKey;default:(-)"`
	CreditCardOrderId *uuid.UUID
	Level             string
	Number            string
	Cvs               string
	ValidDate         time.Time
}

type CreditCardOrderStatus struct {
	Id                *uuid.UUID `gorm:"primaryKey;default:(-)"`
	CreditCardOrderId *uuid.UUID
	Timestamp         time.Time
	Status            string
	Details           string
}

func (CreditCardOrderStatus) TableName() string { return repository.TableCreditCardOrderStatus }
func (CreditCardOrder) TableName() string       { return repository.TableCreditCardOrders }
func (CreditCard) TableName() string            { return repository.TableCreditCards }

var _ repository.CreditCardOrderRepository = (*CreditCardOrderRepository)(nil)

type CreditCardOrderRepository struct{ db *gorm.DB }

func NewCreditCardOrderRepository(db *gorm.DB) repository.CreditCardOrderRepository {
	return &CreditCardOrderRepository{db: db}
}

func (repo *CreditCardOrderRepository) findOrderByAccountID(ctx context.Context, accountID string) (*CreditCardOrder, error) {
	return firstOptional(
		repo.db.WithContext(ctx).Where(q(repository.ColAccountID)+" = ?", accountID),
		func(order *CreditCardOrder) *CreditCardOrder { return order },
	)
}

func (repo *CreditCardOrderRepository) GetByID(ctx context.Context, id string) (*pb.CreditCardOrderMessage, error) {
	return firstOptional(repo.db.WithContext(ctx).Where(q(repository.ColID)+" = ?", id), (*CreditCardOrder).toProto)
}

func (repo *CreditCardOrderRepository) GetShippingAddress(ctx context.Context, orderID string) (*pb.ShippingAddressMessage, error) {
	return firstOptional(repo.db.WithContext(ctx).Where(q(repository.ColID)+" = ?", orderID), (*CreditCardOrder).toShippingAddressProto)
}

func (repo *CreditCardOrderRepository) GetStatusListByAccountID(ctx context.Context, accountID string) ([]*pb.CreditCardOrderStatusMessage, error) {
	order, err := repo.findOrderByAccountID(ctx, accountID)
	if errors.Is(err, repository.ErrNotFound) {
		return nil, repository.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return findAndMapAll(
		repo.db.WithContext(ctx).Where(q(repository.ColCreditCardOrderID)+" = ?", order.Id).Order(q(repository.ColTimestamp)+" DESC"),
		(*CreditCardOrderStatus).toProto,
	)
}

func (repo *CreditCardOrderRepository) GetLastStatusByAccountID(ctx context.Context, accountID string) (*pb.CreditCardOrderStatusMessage, error) {
	order, err := repo.findOrderByAccountID(ctx, accountID)
	if err != nil {
		return nil, err
	}
	return firstOptional(
		repo.db.WithContext(ctx).Where(q(repository.ColCreditCardOrderID)+" = ?", order.Id).Order(q(repository.ColTimestamp)+" DESC"),
		(*CreditCardOrderStatus).toProto,
	)
}

func (repo *CreditCardOrderRepository) GetLastStatusByOrderID(ctx context.Context, orderID string) (*pb.CreditCardOrderStatusMessage, error) {
	return firstOptional(
		repo.db.WithContext(ctx).Where(q(repository.ColCreditCardOrderID)+" = ?", orderID).Order(q(repository.ColTimestamp)+" DESC"),
		(*CreditCardOrderStatus).toProto,
	)
}

func (repo *CreditCardOrderRepository) GetOrdersToManufacture(ctx context.Context) ([]*pb.CreditCardManufactureDataMessage, error) {
	join := "JOIN " + q(repository.TableCreditCardOrderStatus) +
		" ON " + qcol(repository.TableCreditCardOrderStatus, repository.ColCreditCardOrderID) +
		" = " + qcol(repository.TableCreditCardOrders, repository.ColID)
	where := qcol(repository.TableCreditCardOrderStatus, repository.ColStatus) + " = ?"
	query := repo.db.WithContext(ctx).Joins(join).Where(where, repository.StatusOrderCreated)
	return findAndMapAll(query, (*CreditCardOrder).toManufactureDataProto)
}

func (repo *CreditCardOrderRepository) Create(ctx context.Context, req *pb.CreateCreditCardOrderRequest) (*pb.CreditCardOrderMessage, error) {
	dbOrder := orderCreateFromProto(req)
	if err := repo.db.WithContext(ctx).Create(dbOrder).Error; err != nil {
		return nil, err
	}
	return dbOrder.toProto(), nil
}

func (repo *CreditCardOrderRepository) InsertStatus(ctx context.Context, req *pb.InsertNewStatusRequest) (*pb.CreditCardOrderStatusMessage, error) {
	dbStatus := statusFromProto(req)
	if err := repo.db.WithContext(ctx).Create(dbStatus).Error; err != nil {
		return nil, err
	}
	return dbStatus.toProto(), nil
}

func (repo *CreditCardOrderRepository) InsertCard(ctx context.Context, req *pb.InsertNewCreditCardRequest) (*pb.CreditCardMessage, error) {
	dbCard := cardFromProto(req)
	if err := repo.db.WithContext(ctx).Create(dbCard).Error; err != nil {
		return nil, err
	}
	return dbCard.toProto(), nil
}

func (repo *CreditCardOrderRepository) Update(ctx context.Context, msg *pb.CreditCardOrderMessage) (*pb.CreditCardOrderMessage, error) {
	m := orderFromProto(msg)
	if err := repo.db.WithContext(ctx).Save(m).Error; err != nil {
		return nil, err
	}
	return m.toProto(), nil
}

func (repo *CreditCardOrderRepository) DeleteByAccountID(ctx context.Context, accountID string) (int32, error) {
	return affectedRows(repo.db.WithContext(ctx).Where(q(repository.ColAccountID)+" = ?", accountID).Delete(&CreditCardOrder{}))
}

func orderFromProto(msg *pb.CreditCardOrderMessage) *CreditCardOrder {
	m := &CreditCardOrder{
		Id:              parseUUID(msg.Id),
		AccountId:       parseUUID(msg.AccountId),
		Email:           msg.Email,
		Name:            msg.Name,
		ShippingAddress: msg.ShippingAddress,
		CardLevel:       msg.CardLevel,
	}
	if msg.ShippingId != "" {
		m.ShippingId = &msg.ShippingId
	}
	return m
}

func orderCreateFromProto(req *pb.CreateCreditCardOrderRequest) *CreditCardOrder {
	return &CreditCardOrder{
		AccountId:       parseUUID(req.AccountId),
		Email:           req.Email,
		Name:            req.Name,
		ShippingAddress: req.ShippingAddress,
		CardLevel:       req.CardLevel,
	}
}

func (src *CreditCardOrder) toProto() *pb.CreditCardOrderMessage {
	msg := &pb.CreditCardOrderMessage{
		Id:              uuidString(src.Id),
		AccountId:       uuidString(src.AccountId),
		Email:           src.Email,
		Name:            src.Name,
		ShippingAddress: src.ShippingAddress,
		CardLevel:       src.CardLevel,
	}
	if src.ShippingId != nil {
		msg.ShippingId = *src.ShippingId
	}
	return msg
}

func (c *CreditCardOrder) toShippingAddressProto() *pb.ShippingAddressMessage {
	return &pb.ShippingAddressMessage{
		ShippingAddress: c.ShippingAddress,
		Name:            c.Name,
		Email:           c.Email,
	}
}

func (c *CreditCardOrder) toManufactureDataProto() *pb.CreditCardManufactureDataMessage {
	return &pb.CreditCardManufactureDataMessage{
		OrderId:   uuidString(c.Id),
		Name:      c.Name,
		CardLevel: c.CardLevel,
	}
}

func statusFromProto(req *pb.InsertNewStatusRequest) *CreditCardOrderStatus {
	return &CreditCardOrderStatus{
		CreditCardOrderId: parseUUID(req.OrderId),
		Timestamp:         req.Timestamp.AsTime(),
		Status:            req.Status,
		Details:           req.Details,
	}
}

func (src *CreditCardOrderStatus) toProto() *pb.CreditCardOrderStatusMessage {
	return &pb.CreditCardOrderStatusMessage{
		Id:                uuidString(src.Id),
		CreditCardOrderId: uuidString(src.CreditCardOrderId),
		Timestamp:         timestamppb.New(src.Timestamp),
		Status:            src.Status,
		Details:           src.Details,
	}
}

func cardFromProto(req *pb.InsertNewCreditCardRequest) *CreditCard {
	return &CreditCard{
		CreditCardOrderId: parseUUID(req.OrderId),
		Level:             req.CardLevel,
		Number:            req.CardNumber,
		Cvs:               req.CardCvs,
		ValidDate:         req.CardValidDate.AsTime(),
	}
}

func (src *CreditCard) toProto() *pb.CreditCardMessage {
	return &pb.CreditCardMessage{
		OrderId:       uuidString(src.CreditCardOrderId),
		CardLevel:     src.Level,
		CardNumber:    src.Number,
		CardCvs:       src.Cvs,
		CardValidDate: timestamppb.New(src.ValidDate),
	}
}
