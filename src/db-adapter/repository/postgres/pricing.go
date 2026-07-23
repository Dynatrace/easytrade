package postgres

import (
	"context"
	"time"

	"github.com/dynatrace/easytrade/dbadapter/models"
	"github.com/dynatrace/easytrade/dbadapter/repository"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type priceModel struct {
	Id           *uuid.UUID `gorm:"primaryKey;default:gen_random_uuid()"`
	InstrumentId *uuid.UUID
	Timestamp    time.Time
	Open         float64
	High         float64
	Low          float64
	Close        float64
}

func (priceModel) TableName() string { return repository.TablePrices }

func fromPrice(price *models.Price) priceModel {
	return priceModel{
		Id:           parseUUID(price.ID),
		InstrumentId: parseUUID(price.InstrumentID),
		Timestamp:    price.Timestamp,
		Open:         price.Open,
		High:         price.High,
		Low:          price.Low,
		Close:        price.Close,
	}
}

func toPrice(src *priceModel) *models.Price {
	return &models.Price{
		ID:           uuidString(src.Id),
		InstrumentID: uuidString(src.InstrumentId),
		Timestamp:    src.Timestamp,
		Open:         src.Open,
		High:         src.High,
		Low:          src.Low,
		Close:        src.Close,
	}
}

var _ models.PricingRepository = (*PricingRepository)(nil)

type PricingRepository struct{ db *gorm.DB }

func NewPricingRepository(db *gorm.DB) models.PricingRepository {
	return &PricingRepository{db: db}
}

func (repo *PricingRepository) GetLatest(ctx context.Context) ([]*models.Price, error) {
	latest := repo.db.
		Model(&priceModel{}).
		Select(q(repository.ColInstrumentID) + ", MAX(" + q(repository.ColTimestamp) + ") AS " + q("MaxTimestamp")).
		Group(q(repository.ColInstrumentID))
	join := "INNER JOIN (?) AS latest ON " +
		qcol(repository.TablePrices, repository.ColInstrumentID) + " = latest." + q(repository.ColInstrumentID) +
		" AND " + qcol(repository.TablePrices, repository.ColTimestamp) + " = latest." + q("MaxTimestamp")
	query := repo.db.WithContext(ctx).Joins(join, latest)
	return findAll(query, toPrice)
}

func (repo *PricingRepository) GetMostRecent(ctx context.Context, instrumentID string) (*models.Price, error) {
	return firstOptional(
		repo.db.WithContext(ctx).Where(q(repository.ColInstrumentID)+" = ?", instrumentID).Order(q(repository.ColTimestamp)+" DESC"),
		toPrice,
	)
}

func (repo *PricingRepository) GetForInstrument(ctx context.Context, instrumentID string, limit *int) ([]*models.Price, error) {
	query := repo.db.WithContext(ctx).
		Where(q(repository.ColInstrumentID)+" = ?", instrumentID).
		Order(q(repository.ColTimestamp) + " DESC")
	if limit != nil {
		query = query.Limit(*limit)
	}
	return findAll(query, toPrice)
}

func (repo *PricingRepository) InsertBatch(ctx context.Context, prices []*models.Price) (int32, error) {
	if len(prices) == 0 {
		return 0, nil
	}
	dbModels := make([]priceModel, len(prices))
	for i, price := range prices {
		dbModels[i] = fromPrice(price)
	}
	if err := repo.db.WithContext(ctx).CreateInBatches(dbModels, 1000).Error; err != nil {
		return 0, err
	}
	return int32(len(prices)), nil
}

func (repo *PricingRepository) DeleteOlderThan(ctx context.Context, date time.Time) (int32, error) {
	return affectedRows(repo.db.WithContext(ctx).Where(q(repository.ColTimestamp)+" < ?", date).Delete(&priceModel{}))
}
