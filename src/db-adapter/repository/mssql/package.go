package mssql

import (
	"context"

	"github.com/dynatrace/easytrade/dbadapter/models"
	"github.com/dynatrace/easytrade/dbadapter/repository"
	"gorm.io/gorm"
)

type packageModel struct {
	Id      string
	Name    string
	Price   float64
	Support string
}

func (packageModel) TableName() string { return repository.TablePackages }

func toPackage(src *packageModel) *models.Package {
	return &models.Package{
		ID:      src.Id,
		Name:    src.Name,
		Price:   src.Price,
		Support: src.Support,
	}
}

var _ models.PackageRepository = (*PackageRepository)(nil)

type PackageRepository struct{ db *gorm.DB }

func NewPackageRepository(db *gorm.DB) models.PackageRepository {
	return &PackageRepository{db: db}
}

func (repo *PackageRepository) GetAll(ctx context.Context) ([]*models.Package, error) {
	return findAll(repo.db.WithContext(ctx), toPackage)
}
