package models

import (
	"context"
	"time"
)

type Instrument struct {
	ID          string
	ProductID   string
	Code        string
	Name        string
	Description string
}

type OwnedInstrument struct {
	ID                   string
	AccountID            string
	InstrumentID         string
	Quantity             float64
	LastModificationDate time.Time
}

type InstrumentRepository interface {
	GetByID(ctx context.Context, id string) (*Instrument, error)
	GetAll(ctx context.Context) ([]*Instrument, error)
	GetOwned(ctx context.Context, accountID, instrumentID string) (*OwnedInstrument, error)
	GetAllOwned(ctx context.Context, accountID string) ([]*OwnedInstrument, error)
	AddOwned(ctx context.Context, owned *OwnedInstrument) (*OwnedInstrument, error)
	UpdateOwned(ctx context.Context, owned *OwnedInstrument) (*OwnedInstrument, error)
}
