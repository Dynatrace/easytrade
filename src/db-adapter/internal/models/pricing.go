package models

import (
	"context"
	"time"
)

type Price struct {
	ID           string
	InstrumentID string
	Timestamp    time.Time
	Open         float64
	High         float64
	Low          float64
	Close        float64
}

type PricingRepository interface {
	GetLatest(ctx context.Context) ([]*Price, error)
	GetMostRecent(ctx context.Context, instrumentID string) (*Price, error)
	GetForInstrument(ctx context.Context, instrumentID string, limit *int) ([]*Price, error)
	InsertBatch(ctx context.Context, prices []*Price) (int32, error)
	DeleteOlderThan(ctx context.Context, date time.Time) (int32, error)
}
