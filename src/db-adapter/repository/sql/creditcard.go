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

func fromOrderMessage(msg *pb.CreditCardOrderMessage) *creditCardOrderModel {
	m := &creditCardOrderModel{
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

type creditCardOrderModel struct {
	Id              *uuid.UUID `gorm:"primaryKey;default:(-)"`
	AccountId       *uuid.UUID
	Email           string
	Name            string
	ShippingAddress string
	CardLevel       string
	ShippingId      *string
}

func (creditCardOrderModel) TableName() string { return repository.TableCreditCardOrders }

type creditCardOrderStatusModel struct {
	Id                *uuid.UUID `gorm:"primaryKey;default:(-)"`
	CreditCardOrderId *uuid.UUID
	Timestamp         time.Time
	Status            string
	Details           string
}

func (creditCardOrderStatusModel) TableName() string {
	return repository.TableCreditCardOrderStatus
}

type creditCardModel struct {
	Id                *uuid.UUID `gorm:"primaryKey;default:(-)"`
	CreditCardOrderId *uuid.UUID
	Level             string
	Number            string
	Cvs               string
	ValidDate         time.Time
}

func (creditCardModel) TableName() string { return repository.TableCreditCards }

func fromCreateOrder(req *pb.CreateCreditCardOrderRequest) *creditCardOrderModel {
	return &creditCardOrderModel{
		AccountId:       parseUUID(req.AccountId),
		Email:           req.Email,
		Name:            req.Name,
		ShippingAddress: req.ShippingAddress,
		CardLevel:       req.CardLevel,
	}
}

func toOrderProto(src *creditCardOrderModel) *pb.CreditCardOrderMessage {
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

func toShippingAddressProto(src *creditCardOrderModel) *pb.ShippingAddressMessage {
	return &pb.ShippingAddressMessage{
		ShippingAddress: src.ShippingAddress,
		Name:            src.Name,
		Email:           src.Email,
	}
}

func toManufactureDataProto(src *creditCardOrderModel) *pb.CreditCardManufactureDataMessage {
	return &pb.CreditCardManufactureDataMessage{
		OrderId:   uuidString(src.Id),
		Name:      src.Name,
		CardLevel: src.CardLevel,
	}
}

func fromInsertStatus(req *pb.InsertNewStatusRequest) *creditCardOrderStatusModel {
	return &creditCardOrderStatusModel{
		CreditCardOrderId: parseUUID(req.OrderId),
		Timestamp:         req.Timestamp.AsTime(),
		Status:            req.Status,
		Details:           req.Details,
	}
}

func toStatusProto(src *creditCardOrderStatusModel) *pb.CreditCardOrderStatusMessage {
	return &pb.CreditCardOrderStatusMessage{
		Id:                uuidString(src.Id),
		CreditCardOrderId: uuidString(src.CreditCardOrderId),
		Timestamp:         timestamppb.New(src.Timestamp),
		Status:            src.Status,
		Details:           src.Details,
	}
}

func fromInsertCard(req *pb.InsertNewCreditCardRequest) *creditCardModel {
	return &creditCardModel{
		CreditCardOrderId: parseUUID(req.OrderId),
		Level:             req.CardLevel,
		Number:            req.CardNumber,
		Cvs:               req.CardCvs,
		ValidDate:         req.CardValidDate.AsTime(),
	}
}

func toCardProto(src *creditCardModel) *pb.CreditCardMessage {
	return &pb.CreditCardMessage{
		OrderId:       uuidString(src.CreditCardOrderId),
		CardLevel:     src.Level,
		CardNumber:    src.Number,
		CardCvs:       src.Cvs,
		CardValidDate: timestamppb.New(src.ValidDate),
	}
}

var _ repository.CreditCardOrderRepository = (*CreditCardOrderRepository)(nil)

type CreditCardOrderRepository struct{ db *gorm.DB }

func NewCreditCardOrderRepository(db *gorm.DB) repository.CreditCardOrderRepository {
	return &CreditCardOrderRepository{db: db}
}

func (repo *CreditCardOrderRepository) findOrderByAccountID(ctx context.Context, accountID string) (*creditCardOrderModel, error) {
	return firstOptional(
		repo.db.WithContext(ctx).Where(q(repository.ColAccountID)+" = ?", accountID),
		func(order *creditCardOrderModel) *creditCardOrderModel { return order },
	)
}

func (repo *CreditCardOrderRepository) GetByID(ctx context.Context, id string) (*pb.CreditCardOrderMessage, error) {
	return firstOptional(repo.db.WithContext(ctx).Where(q(repository.ColID)+" = ?", id), toOrderProto)
}

func (repo *CreditCardOrderRepository) Create(ctx context.Context, req *pb.CreateCreditCardOrderRequest) (*pb.CreditCardOrderMessage, error) {
	dbOrder := fromCreateOrder(req)
	if err := repo.db.WithContext(ctx).Create(dbOrder).Error; err != nil {
		return nil, err
	}
	return toOrderProto(dbOrder), nil
}

func (repo *CreditCardOrderRepository) GetShippingAddress(ctx context.Context, orderID string) (*pb.ShippingAddressMessage, error) {
	return firstOptional(repo.db.WithContext(ctx).Where(q(repository.ColID)+" = ?", orderID), toShippingAddressProto)
}

func (repo *CreditCardOrderRepository) GetStatusListByAccountID(ctx context.Context, accountID string) ([]*pb.CreditCardOrderStatusMessage, error) {
	order, err := repo.findOrderByAccountID(ctx, accountID)
	if errors.Is(err, repository.ErrNotFound) {
		return nil, repository.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return findAll(
		repo.db.WithContext(ctx).Where(q(repository.ColCreditCardOrderID)+" = ?", order.Id).Order(q(repository.ColTimestamp)+" DESC"),
		toStatusProto,
	)
}

func (repo *CreditCardOrderRepository) GetLastStatusByAccountID(ctx context.Context, accountID string) (*pb.CreditCardOrderStatusMessage, error) {
	order, err := repo.findOrderByAccountID(ctx, accountID)
	if err != nil {
		return nil, err
	}
	return firstOptional(
		repo.db.WithContext(ctx).Where(q(repository.ColCreditCardOrderID)+" = ?", order.Id).Order(q(repository.ColTimestamp)+" DESC"),
		toStatusProto,
	)
}

func (repo *CreditCardOrderRepository) GetOrdersToManufacture(ctx context.Context) ([]*pb.CreditCardManufactureDataMessage, error) {
	join := "JOIN " + q(repository.TableCreditCardOrderStatus) +
		" ON " + qcol(repository.TableCreditCardOrderStatus, repository.ColCreditCardOrderID) +
		" = " + qcol(repository.TableCreditCardOrders, repository.ColID)
	where := qcol(repository.TableCreditCardOrderStatus, repository.ColStatus) + " = ?"
	query := repo.db.WithContext(ctx).Joins(join).Where(where, repository.StatusOrderCreated)
	return findAll(query, toManufactureDataProto)
}

func (repo *CreditCardOrderRepository) InsertStatus(ctx context.Context, req *pb.InsertNewStatusRequest) (*pb.CreditCardOrderStatusMessage, error) {
	dbStatus := fromInsertStatus(req)
	if err := repo.db.WithContext(ctx).Create(dbStatus).Error; err != nil {
		return nil, err
	}
	return toStatusProto(dbStatus), nil
}

func (repo *CreditCardOrderRepository) InsertCard(ctx context.Context, req *pb.InsertNewCreditCardRequest) (*pb.CreditCardMessage, error) {
	dbCard := fromInsertCard(req)
	if err := repo.db.WithContext(ctx).Create(dbCard).Error; err != nil {
		return nil, err
	}
	return toCardProto(dbCard), nil
}

func (repo *CreditCardOrderRepository) Update(ctx context.Context, msg *pb.CreditCardOrderMessage) (*pb.CreditCardOrderMessage, error) {
	m := fromOrderMessage(msg)
	if err := repo.db.WithContext(ctx).Save(m).Error; err != nil {
		return nil, err
	}
	return toOrderProto(m), nil
}

func (repo *CreditCardOrderRepository) DeleteByAccountID(ctx context.Context, accountID string) (int32, error) {
	return affectedRows(repo.db.WithContext(ctx).Where(q(repository.ColAccountID)+" = ?", accountID).Delete(&creditCardOrderModel{}))
}
