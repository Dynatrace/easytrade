package mssql

import (
	"context"

	"github.com/dynatrace/easytrade/dbadapter/models"
	"github.com/dynatrace/easytrade/dbadapter/repository"
	mssql "github.com/microsoft/go-mssqldb"
	"gorm.io/gorm"
)

type productModel struct {
	Id       mssql.UniqueIdentifier `gorm:"primaryKey"`
	Name     string
	Ppt      float64
	Currency string
}

func (productModel) TableName() string { return repository.TableProducts }

func toProduct(src *productModel) *models.Product {
	return &models.Product{
		ID:       uuidString(src.Id),
		Name:     src.Name,
		Ppt:      src.Ppt,
		Currency: src.Currency,
	}
}

var _ models.ProductRepository = (*ProductRepository)(nil)

type ProductRepository struct{ db *gorm.DB }

func NewProductRepository(db *gorm.DB) models.ProductRepository {
	return &ProductRepository{db: db}
}

func (repo *ProductRepository) GetAll(ctx context.Context) ([]*models.Product, error) {
	return findAll(repo.db.WithContext(ctx), toProduct)
}
