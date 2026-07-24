package sql

import (
	"context"
	"time"

	pb "github.com/dynatrace/easytrade/dbadapter/proto"
	"github.com/dynatrace/easytrade/dbadapter/repository"
	"github.com/google/uuid"
	"google.golang.org/protobuf/types/known/timestamppb"
	"gorm.io/gorm"
)

type accountModel struct {
	Id                    *uuid.UUID `gorm:"primaryKey;default:(-)"`
	PackageId             *uuid.UUID
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

func (accountModel) TableName() string { return repository.TableAccounts }

func fromCreateAccount(req *pb.CreateAccountRequest) *accountModel {
	return &accountModel{
		PackageId:             parseUUID(req.PackageId),
		FirstName:             req.FirstName,
		LastName:              req.LastName,
		Username:              req.Username,
		Email:                 req.Email,
		HashedPassword:        req.Password,
		Origin:                req.Origin,
		CreationDate:          req.CreationDate.AsTime(),
		PackageActivationDate: req.PackageActivationDate.AsTime(),
		AccountActive:         req.AccountActive,
		Address:               req.Address,
	}
}

func toAccountProto(src *accountModel) *pb.AccountMessage {
	return &pb.AccountMessage{
		Id:                    uuidString(src.Id),
		PackageId:             uuidString(src.PackageId),
		FirstName:             src.FirstName,
		LastName:              src.LastName,
		Username:              src.Username,
		Email:                 src.Email,
		HashedPassword:        src.HashedPassword,
		Origin:                src.Origin,
		CreationDate:          timestamppb.New(src.CreationDate),
		PackageActivationDate: timestamppb.New(src.PackageActivationDate),
		AccountActive:         src.AccountActive,
		Address:               src.Address,
	}
}

var _ repository.AccountRepository = (*AccountRepository)(nil)

type AccountRepository struct{ db *gorm.DB }

func NewAccountRepository(db *gorm.DB) repository.AccountRepository {
	return &AccountRepository{db: db}
}

func (repo *AccountRepository) Create(ctx context.Context, req *pb.CreateAccountRequest) (*pb.AccountMessage, error) {
	dbAccount := fromCreateAccount(req)
	if err := repo.db.WithContext(ctx).Create(dbAccount).Error; err != nil {
		return nil, err
	}
	return toAccountProto(dbAccount), nil
}

func (repo *AccountRepository) GetByID(ctx context.Context, id string) (*pb.AccountMessage, error) {
	return firstOptional(repo.db.WithContext(ctx).Where(q(repository.ColID)+" = ?", id), toAccountProto)
}

func (repo *AccountRepository) GetByUsername(ctx context.Context, username string) (*pb.AccountMessage, error) {
	return firstOptional(repo.db.WithContext(ctx).Where(q(repository.ColUsername)+" = ?", username), toAccountProto)
}

func (repo *AccountRepository) GetAll(ctx context.Context) ([]*pb.AccountMessage, error) {
	return findAll(repo.db.WithContext(ctx), toAccountProto)
}

func (repo *AccountRepository) DeleteOlderThan(ctx context.Context, before *time.Time, origin string) (int32, error) {
	db := repo.db.WithContext(ctx).Where(q(repository.ColOrigin)+" = ?", origin)
	if before != nil {
		db = db.Where(q(repository.ColCreationDate)+" < ?", *before)
	}
	return affectedRows(db.Delete(&accountModel{}))
}
