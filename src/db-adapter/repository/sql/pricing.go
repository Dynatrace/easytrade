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

type priceModel struct {
	Id           *uuid.UUID `gorm:"primaryKey;default:(-)"`
	InstrumentId *uuid.UUID
	Timestamp    time.Time
	Open         float64
	High         float64
	Low          float64
	Close        float64
}

func (priceModel) TableName() string { return repository.TablePrices }

func fromPricingRow(row *pb.PricingRow) priceModel {
	return priceModel{
		InstrumentId: parseUUID(row.InstrumentId),
		Timestamp:    row.Timestamp.AsTime(),
		Open:         row.Open,
		High:         row.High,
		Low:          row.Low,
		Close:        row.Close,
	}
}

func toPriceProto(src *priceModel) *pb.PriceMessage {
	return &pb.PriceMessage{
		Id:           uuidString(src.Id),
		InstrumentId: uuidString(src.InstrumentId),
		Timestamp:    timestamppb.New(src.Timestamp),
		Open:         src.Open,
		High:         src.High,
		Low:          src.Low,
		Close:        src.Close,
	}
}

var _ repository.PricingRepository = (*PricingRepository)(nil)

type PricingRepository struct{ db *gorm.DB }

func NewPricingRepository(db *gorm.DB) repository.PricingRepository {
	return &PricingRepository{db: db}
}

func (repo *PricingRepository) GetLatest(ctx context.Context) ([]*pb.PriceMessage, error) {
	latest := repo.db.
		Model(&priceModel{}).
		Select(q(repository.ColInstrumentID) + ", MAX(" + q(repository.ColTimestamp) + ") AS " + q("MaxTimestamp")).
		Group(repository.ColInstrumentID)
	join := "INNER JOIN (?) AS latest ON " +
		qcol(repository.TablePrices, repository.ColInstrumentID) + " = latest." + q(repository.ColInstrumentID) +
		" AND " + qcol(repository.TablePrices, repository.ColTimestamp) + " = latest." + q("MaxTimestamp")
	query := repo.db.WithContext(ctx).Joins(join, latest)
	return findAll(query, toPriceProto)
}

func (repo *PricingRepository) GetMostRecent(ctx context.Context, instrumentID string) (*pb.PriceMessage, error) {
	return firstOptional(
		repo.db.WithContext(ctx).Where(q(repository.ColInstrumentID)+" = ?", instrumentID).Order(q(repository.ColTimestamp)+" DESC"),
		toPriceProto,
	)
}

func (repo *PricingRepository) GetForInstrument(ctx context.Context, instrumentID string, limit *int) ([]*pb.PriceMessage, error) {
	query := repo.db.WithContext(ctx).
		Where(q(repository.ColInstrumentID)+" = ?", instrumentID).
		Order(q(repository.ColTimestamp) + " DESC")
	if limit != nil {
		query = query.Limit(*limit)
	}
	return findAll(query, toPriceProto)
}

func (repo *PricingRepository) InsertBatch(ctx context.Context, req *pb.InsertPricesBatchRequest) (int32, error) {
	if len(req.Rows) == 0 {
		return 0, nil
	}
	dbModels := make([]priceModel, len(req.Rows))
	for i, row := range req.Rows {
		dbModels[i] = fromPricingRow(row)
	}
	if err := repo.db.WithContext(ctx).CreateInBatches(dbModels, 1000).Error; err != nil {
		return 0, err
	}
	return int32(len(req.Rows)), nil
}

func (repo *PricingRepository) DeleteOlderThan(ctx context.Context, date time.Time) (int32, error) {
	return affectedRows(repo.db.WithContext(ctx).Where(q(repository.ColTimestamp)+" < ?", date).Delete(&priceModel{}))
}
