package sql

import (
	"context"

	pb "github.com/dynatrace/easytrade/dbadapter/proto"
	"github.com/dynatrace/easytrade/dbadapter/repository"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Product struct {
	Id       *uuid.UUID `gorm:"primaryKey;default:(-)"`
	Name     string
	Ppt      float64
	Currency string
}

func (Product) TableName() string { return repository.TableProducts }

var _ repository.ProductRepository = (*ProductRepository)(nil)

type ProductRepository struct{ db *gorm.DB }

func NewProductRepository(db *gorm.DB) repository.ProductRepository {
	return &ProductRepository{db: db}
}

func (repo *ProductRepository) GetAll(ctx context.Context) ([]*pb.ProductMessage, error) {
	return findAndMapAll(repo.db.WithContext(ctx), (*Product).toProto)
}

func (src *Product) toProto() *pb.ProductMessage {
	return &pb.ProductMessage{
		Id:       uuidString(src.Id),
		Name:     src.Name,
		Ppt:      src.Ppt,
		Currency: src.Currency,
	}
}
