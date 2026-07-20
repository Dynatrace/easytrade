package models

import (
	"context"
	"time"
)

type CreditCardOrder struct {
	ID              string
	AccountID       string
	Email           string
	Name            string
	ShippingAddress string
	CardLevel       string
	ShippingID      string
}

type CreditCardOrderStatus struct {
	ID                string
	CreditCardOrderID string
	Timestamp         time.Time
	Status            string
	Details           string
}

type CreditCard struct {
	OrderID   string
	Level     string
	Number    string
	CVS       string
	ValidDate time.Time
}

type CreditCardOrderRepository interface {
	Create(ctx context.Context, order *CreditCardOrder) (*CreditCardOrder, error)
	GetShippingAddress(ctx context.Context, orderID string) (*CreditCardOrder, error)
	GetStatusListByAccountID(ctx context.Context, accountID string) ([]*CreditCardOrderStatus, error)
	GetLastStatusByAccountID(ctx context.Context, accountID string) (*CreditCardOrderStatus, error)
	GetOrdersToManufacture(ctx context.Context) ([]*CreditCardOrder, error)
	InsertStatus(ctx context.Context, status *CreditCardOrderStatus) (*CreditCardOrderStatus, error)
	InsertCard(ctx context.Context, card *CreditCard) (*CreditCard, error)
	UpdateShippingID(ctx context.Context, orderID, shippingID string) (*CreditCardOrder, error)
	DeleteByAccountID(ctx context.Context, accountID string) (int32, error)
}
