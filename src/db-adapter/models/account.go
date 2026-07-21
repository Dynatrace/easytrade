package models

import (
	"context"
	"time"
)

type Account struct {
	ID                    string
	PackageID             string
	FirstName             string
	LastName              string
	Username              string
	Email                 string
	HashedPassword        string
	Origin                string
	CreationDate          time.Time
	PackageActivationDate time.Time
	AccountActive         bool
	Address               string
}

type AccountRepository interface {
	Create(ctx context.Context, account *Account) (*Account, error)
	GetByID(ctx context.Context, id string) (*Account, error)
	GetByUsername(ctx context.Context, username string) (*Account, error)
	GetAll(ctx context.Context) ([]*Account, error)
	DeleteOlderThan(ctx context.Context, date time.Time, origin string) (int32, error)
}
