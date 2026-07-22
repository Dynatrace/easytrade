package mssql

import (
	"context"
	"time"

	"github.com/dynatrace/easytrade/dbadapter/models"
	"github.com/dynatrace/easytrade/dbadapter/repository"
	"gorm.io/gorm"
)

type accountModel struct {
	Id                    string `gorm:"primaryKey"`
	PackageId             string
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

func toAccount(src *accountModel) *models.Account {
	return &models.Account{
		ID:                    src.Id,
		PackageID:             src.PackageId,
		FirstName:             src.FirstName,
		LastName:              src.LastName,
		Username:              src.Username,
		Email:                 src.Email,
		HashedPassword:        src.HashedPassword,
		Origin:                src.Origin,
		CreationDate:          src.CreationDate,
		PackageActivationDate: src.PackageActivationDate,
		AccountActive:         src.AccountActive,
		Address:               src.Address,
	}
}

func fromAccount(account *models.Account) *accountModel {
	return &accountModel{
		Id:                    account.ID,
		PackageId:             account.PackageID,
		FirstName:             account.FirstName,
		LastName:              account.LastName,
		Username:              account.Username,
		Email:                 account.Email,
		HashedPassword:        account.HashedPassword,
		Origin:                account.Origin,
		CreationDate:          account.CreationDate,
		PackageActivationDate: account.PackageActivationDate,
		AccountActive:         account.AccountActive,
		Address:               account.Address,
	}
}

var _ models.AccountRepository = (*AccountRepository)(nil)

type AccountRepository struct{ db *gorm.DB }

func NewAccountRepository(db *gorm.DB) models.AccountRepository {
	return &AccountRepository{db: db}
}

func (repo *AccountRepository) Create(ctx context.Context, account *models.Account) (*models.Account, error) {
	dbAccount := fromAccount(account)
	if err := repo.db.WithContext(ctx).Create(dbAccount).Error; err != nil {
		return nil, err
	}
	return toAccount(dbAccount), nil
}

func (repo *AccountRepository) GetByID(ctx context.Context, id string) (*models.Account, error) {
	return firstOptional(repo.db.WithContext(ctx).Where(repository.ColID+" = ?", id), toAccount)
}

func (repo *AccountRepository) GetByUsername(ctx context.Context, username string) (*models.Account, error) {
	return firstOptional(repo.db.WithContext(ctx).Where(repository.ColUsername+" = ?", username), toAccount)
}

func (repo *AccountRepository) GetAll(ctx context.Context) ([]*models.Account, error) {
	return findAll(repo.db.WithContext(ctx), toAccount)
}

func (repo *AccountRepository) DeleteOlderThan(ctx context.Context, date time.Time, origin string) (int32, error) {
	return affectedRows(repo.db.WithContext(ctx).
		Where(repository.ColCreationDate+" < ?", date).
		Where(repository.ColOrigin+" = ?", origin).
		Delete(&accountModel{}))
}
