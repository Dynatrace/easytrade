package models

import "context"

type Package struct {
	ID      string
	Name    string
	Price   float64
	Support string
}

type PackageRepository interface {
	GetAll(ctx context.Context) ([]*Package, error)
}
