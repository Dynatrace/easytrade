package mssql

import (
	"context"
	"time"

	"github.com/dynatrace/easytrade/dbadapter/models"
	"github.com/dynatrace/easytrade/dbadapter/repository"
	mssql "github.com/microsoft/go-mssqldb"
	"gorm.io/gorm"
)

type tradeModel struct {
	Id                  *mssql.UniqueIdentifier `gorm:"primaryKey;default:newid()"`
	AccountId           *mssql.UniqueIdentifier
	InstrumentId        *mssql.UniqueIdentifier
	Direction           string
	Quantity            float64
	EntryPrice          float64
	TimestampOpen       time.Time
	TimestampClose      *time.Time
	TradeClosed         bool
	TransactionHappened bool
	Status              string
}

func (tradeModel) TableName() string { return repository.TableTrades }

func toTrade(src *tradeModel) *models.Trade {
	return &models.Trade{
		ID:                  uuidString(src.Id),
		AccountID:           uuidString(src.AccountId),
		InstrumentID:        uuidString(src.InstrumentId),
		Direction:           src.Direction,
		Quantity:            src.Quantity,
		EntryPrice:          src.EntryPrice,
		TimestampOpen:       src.TimestampOpen,
		TimestampClose:      src.TimestampClose,
		TradeClosed:         src.TradeClosed,
		TransactionHappened: src.TransactionHappened,
		Status:              src.Status,
	}
}

func fromTrade(trade *models.Trade) *tradeModel {
	return &tradeModel{
		Id:                  parseUUID(trade.ID),
		AccountId:           parseUUID(trade.AccountID),
		InstrumentId:        parseUUID(trade.InstrumentID),
		Direction:           trade.Direction,
		Quantity:            trade.Quantity,
		EntryPrice:          trade.EntryPrice,
		TimestampOpen:       trade.TimestampOpen,
		TimestampClose:      trade.TimestampClose,
		TradeClosed:         trade.TradeClosed,
		TransactionHappened: trade.TransactionHappened,
		Status:              trade.Status,
	}
}

var _ models.TradeRepository = (*TradeRepository)(nil)

type TradeRepository struct{ db *gorm.DB }

func NewTradeRepository(db *gorm.DB) models.TradeRepository {
	return &TradeRepository{db: db}
}

func (repo *TradeRepository) Create(ctx context.Context, trade *models.Trade) (*models.Trade, error) {
	dbTrade := fromTrade(trade)
	if err := repo.db.WithContext(ctx).Create(dbTrade).Error; err != nil {
		return nil, err
	}
	return toTrade(dbTrade), nil
}

func (repo *TradeRepository) GetByID(ctx context.Context, id string) (*models.Trade, error) {
	return firstOptional(repo.db.WithContext(ctx).Where(repository.ColID+" = ?", id), toTrade)
}

func (repo *TradeRepository) Update(ctx context.Context, trade *models.Trade) (*models.Trade, error) {
	dbTrade := fromTrade(trade)
	if err := repo.db.WithContext(ctx).Save(dbTrade).Error; err != nil {
		return nil, err
	}
	return toTrade(dbTrade), nil
}

func (repo *TradeRepository) GetOpen(ctx context.Context) ([]*models.Trade, error) {
	return findAll(repo.db.WithContext(ctx).Where(repository.ColTradeClosed+" = ?", false), toTrade)
}

func (repo *TradeRepository) GetExpired(ctx context.Context) ([]*models.Trade, error) {
	return findAll(
		repo.db.WithContext(ctx).
			Where(repository.ColTradeClosed+" = ?", false).
			Where(repository.ColTimestampClose+" IS NOT NULL AND "+repository.ColTimestampClose+" < ?", time.Now()),
		toTrade,
	)
}

func (repo *TradeRepository) GetByAccount(ctx context.Context, accountID string, filter models.TradeFilter) ([]*models.Trade, error) {
	query := repo.db.WithContext(ctx).Where(repository.ColAccountID+" = ?", accountID)
	if filter.OnlyOpen {
		query = query.Where(repository.ColTradeClosed+" = ?", false)
	}
	if filter.OnlyLong {
		query = query.Where(repository.ColDirection+" IN (?, ?)", repository.DirectionLongBuy, repository.DirectionLongSell)
	}
	return findAll(query, toTrade)
}

func (repo *TradeRepository) DeleteOlderThan(ctx context.Context, date time.Time) (int32, error) {
	return affectedRows(repo.db.WithContext(ctx).Where(repository.ColTimestampOpen+" < ?", date).Delete(&tradeModel{}))
}
