package sql

import (
	"context"

	pb "github.com/dynatrace/easytrade/dbadapter/proto"
	"github.com/dynatrace/easytrade/dbadapter/repository"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type packageModel struct {
	Id      *uuid.UUID `gorm:"primaryKey;default:(-)"`
	Name    string
	Price   float64
	Support string
}

func (packageModel) TableName() string { return repository.TablePackages }

func toPackageProto(src *packageModel) *pb.PackageMessage {
	return &pb.PackageMessage{
		Id:      uuidString(src.Id),
		Name:    src.Name,
		Price:   src.Price,
		Support: src.Support,
	}
}

var _ repository.PackageRepository = (*PackageRepository)(nil)

type PackageRepository struct{ db *gorm.DB }

func NewPackageRepository(db *gorm.DB) repository.PackageRepository {
	return &PackageRepository{db: db}
}

func (repo *PackageRepository) GetAll(ctx context.Context) ([]*pb.PackageMessage, error) {
	return findAll(repo.db.WithContext(ctx), toPackageProto)
}
