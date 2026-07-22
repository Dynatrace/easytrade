package mssql

import (
	"context"
	"time"

	"github.com/dynatrace/easytrade/dbadapter/models"
	"github.com/dynatrace/easytrade/dbadapter/repository"
	mssql "github.com/microsoft/go-mssqldb"
	"gorm.io/gorm"
)

type balanceModel struct {
	AccountId mssql.UniqueIdentifier `gorm:"primaryKey"`
	Value     float64
}

func (balanceModel) TableName() string { return repository.TableBalances }

type balanceHistoryModel struct {
	Id          mssql.UniqueIdentifier `gorm:"primaryKey"`
	AccountId   mssql.UniqueIdentifier
	OldValue    float64
	ValueChange float64
	ActionType  string
	ActionDate  time.Time
}

func (balanceHistoryModel) TableName() string { return repository.TableBalanceHistory }

func toBalance(src *balanceModel) *models.Balance {
	return &models.Balance{AccountID: uuidString(src.AccountId), Value: src.Value}
}

func fromBalance(balance *models.Balance) *balanceModel {
	return &balanceModel{AccountId: parseUUID(balance.AccountID), Value: balance.Value}
}

func toBalanceHistory(src *balanceHistoryModel) *models.BalanceHistory {
	return &models.BalanceHistory{
		ID:          uuidString(src.Id),
		AccountID:   uuidString(src.AccountId),
		OldValue:    src.OldValue,
		ValueChange: src.ValueChange,
		ActionType:  src.ActionType,
		ActionDate:  src.ActionDate,
	}
}

func fromBalanceHistory(history *models.BalanceHistory) *balanceHistoryModel {
	return &balanceHistoryModel{
		Id:          newIfEmpty(history.ID),
		AccountId:   parseUUID(history.AccountID),
		OldValue:    history.OldValue,
		ValueChange: history.ValueChange,
		ActionType:  history.ActionType,
		ActionDate:  history.ActionDate,
	}
}

var _ models.BalanceRepository = (*BalanceRepository)(nil)

type BalanceRepository struct{ db *gorm.DB }

func NewBalanceRepository(db *gorm.DB) models.BalanceRepository {
	return &BalanceRepository{db: db}
}

func (repo *BalanceRepository) Create(ctx context.Context, balance *models.Balance) (*models.Balance, error) {
	dbBalance := fromBalance(balance)
	if err := repo.db.WithContext(ctx).Create(dbBalance).Error; err != nil {
		return nil, err
	}
	return toBalance(dbBalance), nil
}

func (repo *BalanceRepository) GetByAccountID(ctx context.Context, accountID string) (*models.Balance, error) {
	return firstOptional(repo.db.WithContext(ctx).Where(repository.ColAccountID+" = ?", accountID), toBalance)
}

func (repo *BalanceRepository) Update(ctx context.Context, balance *models.Balance) (*models.Balance, error) {
	dbBalance := fromBalance(balance)
	if err := repo.db.WithContext(ctx).Save(dbBalance).Error; err != nil {
		return nil, err
	}
	return toBalance(dbBalance), nil
}

func (repo *BalanceRepository) AddHistory(ctx context.Context, history *models.BalanceHistory) (*models.BalanceHistory, error) {
	dbHistory := fromBalanceHistory(history)
	if err := repo.db.WithContext(ctx).Create(dbHistory).Error; err != nil {
		return nil, err
	}
	return toBalanceHistory(dbHistory), nil
}

func (repo *BalanceRepository) DeleteHistoryOlderThan(ctx context.Context, date time.Time) (int32, error) {
	return affectedRows(repo.db.WithContext(ctx).Where(repository.ColActionDate+" < ?", date).Delete(&balanceHistoryModel{}))
}
