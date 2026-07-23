package mssql

import (
	"context"
	"errors"
	"time"

	"github.com/dynatrace/easytrade/dbadapter/models"
	"github.com/dynatrace/easytrade/dbadapter/repository"
	mssql "github.com/microsoft/go-mssqldb"
	"gorm.io/gorm"
)

type creditCardOrderModel struct {
	Id              *mssql.UniqueIdentifier `gorm:"primaryKey;default:newid()"`
	AccountId       *mssql.UniqueIdentifier
	Email           string
	Name            string
	ShippingAddress string
	CardLevel       string
	ShippingId      *string
}

func (creditCardOrderModel) TableName() string { return repository.TableCreditCardOrders }

type creditCardOrderStatusModel struct {
	Id                *mssql.UniqueIdentifier `gorm:"primaryKey;default:newid()"`
	CreditCardOrderId *mssql.UniqueIdentifier
	Timestamp         time.Time
	Status            string
	Details           string
}

func (creditCardOrderStatusModel) TableName() string {
	return repository.TableCreditCardOrderStatus
}

type creditCardModel struct {
	Id                *mssql.UniqueIdentifier `gorm:"primaryKey;default:newid()"`
	CreditCardOrderId *mssql.UniqueIdentifier
	Level             string
	Number            string
	Cvs               string
	ValidDate         time.Time
}

func (creditCardModel) TableName() string { return repository.TableCreditCards }

func toCreditCardOrder(src *creditCardOrderModel) *models.CreditCardOrder {
	order := &models.CreditCardOrder{
		ID:              uuidString(src.Id),
		AccountID:       uuidString(src.AccountId),
		Email:           src.Email,
		Name:            src.Name,
		ShippingAddress: src.ShippingAddress,
		CardLevel:       src.CardLevel,
	}
	if src.ShippingId != nil {
		order.ShippingID = *src.ShippingId
	}
	return order
}

func fromCreditCardOrder(order *models.CreditCardOrder) *creditCardOrderModel {
	dbOrder := &creditCardOrderModel{
		Id:              parseUUID(order.ID),
		AccountId:       parseUUID(order.AccountID),
		Email:           order.Email,
		Name:            order.Name,
		ShippingAddress: order.ShippingAddress,
		CardLevel:       order.CardLevel,
	}
	if order.ShippingID != "" {
		dbOrder.ShippingId = &order.ShippingID
	}
	return dbOrder
}

func toCreditCardOrderStatus(src *creditCardOrderStatusModel) *models.CreditCardOrderStatus {
	return &models.CreditCardOrderStatus{
		ID:                uuidString(src.Id),
		CreditCardOrderID: uuidString(src.CreditCardOrderId),
		Timestamp:         src.Timestamp,
		Status:            src.Status,
		Details:           src.Details,
	}
}

func fromCreditCardOrderStatus(status *models.CreditCardOrderStatus) *creditCardOrderStatusModel {
	return &creditCardOrderStatusModel{
		Id:                parseUUID(status.ID),
		CreditCardOrderId: parseUUID(status.CreditCardOrderID),
		Timestamp:         status.Timestamp,
		Status:            status.Status,
		Details:           status.Details,
	}
}

func toCreditCard(src *creditCardModel) *models.CreditCard {
	return &models.CreditCard{
		ID:        uuidString(src.Id),
		OrderID:   uuidString(src.CreditCardOrderId),
		Level:     src.Level,
		Number:    src.Number,
		CVS:       src.Cvs,
		ValidDate: src.ValidDate,
	}
}

func fromCreditCard(card *models.CreditCard) *creditCardModel {
	return &creditCardModel{
		Id:                parseUUID(card.ID),
		CreditCardOrderId: parseUUID(card.OrderID),
		Level:             card.Level,
		Number:            card.Number,
		Cvs:               card.CVS,
		ValidDate:         card.ValidDate,
	}
}

var _ models.CreditCardOrderRepository = (*CreditCardOrderRepository)(nil)

type CreditCardOrderRepository struct{ db *gorm.DB }

func NewCreditCardOrderRepository(db *gorm.DB) models.CreditCardOrderRepository {
	return &CreditCardOrderRepository{db: db}
}

func (repo *CreditCardOrderRepository) findOrderByAccountID(ctx context.Context, accountID string) (*creditCardOrderModel, error) {
	return firstOptional(
		repo.db.WithContext(ctx).Where(repository.ColAccountID+" = ?", accountID),
		func(order *creditCardOrderModel) *creditCardOrderModel { return order },
	)
}

func (repo *CreditCardOrderRepository) Create(ctx context.Context, order *models.CreditCardOrder) (*models.CreditCardOrder, error) {
	dbOrder := fromCreditCardOrder(order)
	if err := repo.db.WithContext(ctx).Create(dbOrder).Error; err != nil {
		return nil, err
	}
	return toCreditCardOrder(dbOrder), nil
}

func (repo *CreditCardOrderRepository) GetShippingAddress(ctx context.Context, orderID string) (*models.CreditCardOrder, error) {
	return firstOptional(repo.db.WithContext(ctx).Where(repository.ColID+" = ?", parseUUID(orderID)), toCreditCardOrder)
}

func (repo *CreditCardOrderRepository) GetStatusListByAccountID(ctx context.Context, accountID string) ([]*models.CreditCardOrderStatus, error) {
	order, err := repo.findOrderByAccountID(ctx, accountID)
	if errors.Is(err, repository.ErrNotFound) {
		return nil, repository.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return findAll(
		repo.db.WithContext(ctx).Where(repository.ColCreditCardOrderID+" = ?", order.Id).Order(repository.ColTimestamp+" DESC"),
		toCreditCardOrderStatus,
	)
}

func (repo *CreditCardOrderRepository) GetLastStatusByAccountID(ctx context.Context, accountID string) (*models.CreditCardOrderStatus, error) {
	order, err := repo.findOrderByAccountID(ctx, accountID)
	if err != nil {
		return nil, err
	}
	return firstOptional(
		repo.db.WithContext(ctx).Where(repository.ColCreditCardOrderID+" = ?", order.Id).Order(repository.ColTimestamp+" DESC"),
		toCreditCardOrderStatus,
	)
}

func (repo *CreditCardOrderRepository) GetOrdersToManufacture(ctx context.Context) ([]*models.CreditCardOrder, error) {
	join := "JOIN " + repository.TableCreditCardOrderStatus +
		" ON " + repository.TableCreditCardOrderStatus + "." + repository.ColCreditCardOrderID +
		" = " + repository.TableCreditCardOrders + "." + repository.ColID
	where := repository.TableCreditCardOrderStatus + "." + repository.ColStatus + " = ?"
	query := repo.db.WithContext(ctx).Joins(join).Where(where, repository.StatusOrderCreated)
	return findAll(query, toCreditCardOrder)
}

func (repo *CreditCardOrderRepository) InsertStatus(ctx context.Context, status *models.CreditCardOrderStatus) (*models.CreditCardOrderStatus, error) {
	dbStatus := fromCreditCardOrderStatus(status)
	if err := repo.db.WithContext(ctx).Create(dbStatus).Error; err != nil {
		return nil, err
	}
	return toCreditCardOrderStatus(dbStatus), nil
}

func (repo *CreditCardOrderRepository) InsertCard(ctx context.Context, card *models.CreditCard) (*models.CreditCard, error) {
	dbCard := fromCreditCard(card)
	if err := repo.db.WithContext(ctx).Create(dbCard).Error; err != nil {
		return nil, err
	}
	return toCreditCard(dbCard), nil
}

func (repo *CreditCardOrderRepository) Update(ctx context.Context, order *models.CreditCardOrder) (*models.CreditCardOrder, error) {
	dbOrder := fromCreditCardOrder(order)
	if err := repo.db.WithContext(ctx).Save(dbOrder).Error; err != nil {
		return nil, err
	}
	return toCreditCardOrder(dbOrder), nil
}

func (repo *CreditCardOrderRepository) DeleteByAccountID(ctx context.Context, accountID string) (int32, error) {
	return affectedRows(repo.db.WithContext(ctx).Where(repository.ColAccountID+" = ?", accountID).Delete(&creditCardOrderModel{}))
}
