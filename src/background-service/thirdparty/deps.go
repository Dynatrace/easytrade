package thirdparty

import "context"

type creditCardOrderService interface {
	GetShippingAddress(ctx context.Context, orderID string) (*ShippingAddress, error)
	UpdateStatus(ctx context.Context, status OrderStatus, orderID string, details any) error
}

type flagChecker interface {
	GetBool(ctx context.Context, id string, defaultVal bool) bool
}
