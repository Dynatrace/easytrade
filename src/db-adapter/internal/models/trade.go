package models

import (
	"context"
	"time"
)

type Trade struct {
	ID                  string
	AccountID           string
	InstrumentID        string
	Direction           string
	Quantity            float64
	EntryPrice          float64
	TimestampOpen       time.Time
	TimestampClose      *time.Time
	TradeClosed         bool
	TransactionHappened bool
	Status              string
}

type TradeFilter struct {
	OnlyOpen bool
	OnlyLong bool
}

type TradeRepository interface {
	Create(ctx context.Context, trade *Trade) (*Trade, error)
	GetByID(ctx context.Context, id string) (*Trade, error)
	Update(ctx context.Context, trade *Trade) (*Trade, error)
	GetOpen(ctx context.Context) ([]*Trade, error)
	GetExpired(ctx context.Context) ([]*Trade, error)
	GetByAccount(ctx context.Context, accountID string, filter TradeFilter) ([]*Trade, error)
	DeleteOlderThan(ctx context.Context, date time.Time) (int32, error)
}
