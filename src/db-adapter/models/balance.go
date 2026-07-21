package models

import (
	"context"
	"time"
)

type Balance struct {
	AccountID string
	Value     float64
}

type BalanceHistory struct {
	ID          string
	AccountID   string
	OldValue    float64
	ValueChange float64
	ActionType  string
	ActionDate  time.Time
}

type BalanceRepository interface {
	Create(ctx context.Context, balance *Balance) (*Balance, error)
	GetByAccountID(ctx context.Context, accountID string) (*Balance, error)
	Update(ctx context.Context, balance *Balance) (*Balance, error)
	AddHistory(ctx context.Context, history *BalanceHistory) (*BalanceHistory, error)
	DeleteHistoryOlderThan(ctx context.Context, date time.Time) (int32, error)
}
