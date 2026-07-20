package models

import "context"

type Product struct {
	ID       string
	Name     string
	Ppt      float64
	Currency string
}

type ProductRepository interface {
	GetAll(ctx context.Context) ([]*Product, error)
}
