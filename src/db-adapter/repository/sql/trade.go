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

type tradeModel struct {
	Id                  *uuid.UUID `gorm:"primaryKey;default:(-)"`
	AccountId           *uuid.UUID
	InstrumentId        *uuid.UUID
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

func fromCreateTrade(req *pb.CreateTradeRequest) *tradeModel {
	return &tradeModel{
		AccountId:           parseUUID(req.AccountId),
		InstrumentId:        parseUUID(req.InstrumentId),
		Direction:           req.Direction,
		Quantity:            req.Quantity,
		EntryPrice:          req.EntryPrice,
		TimestampOpen:       req.TimestampOpen.AsTime(),
		TimestampClose:      optionalTime(req.TimestampClose),
		TradeClosed:         req.TradeClosed,
		TransactionHappened: req.TransactionHappened,
		Status:              req.Status,
	}
}

func toTradeProto(src *tradeModel) *pb.TradeMessage {
	msg := &pb.TradeMessage{
		Id:                  uuidString(src.Id),
		AccountId:           uuidString(src.AccountId),
		InstrumentId:        uuidString(src.InstrumentId),
		Direction:           src.Direction,
		Quantity:            src.Quantity,
		EntryPrice:          src.EntryPrice,
		TimestampOpen:       timestamppb.New(src.TimestampOpen),
		TradeClosed:         src.TradeClosed,
		TransactionHappened: src.TransactionHappened,
		Status:              src.Status,
	}
	if src.TimestampClose != nil {
		msg.TimestampClose = timestamppb.New(*src.TimestampClose)
	}
	return msg
}

var _ repository.TradeRepository = (*TradeRepository)(nil)

type TradeRepository struct{ db *gorm.DB }

func NewTradeRepository(db *gorm.DB) repository.TradeRepository {
	return &TradeRepository{db: db}
}

func (repo *TradeRepository) Create(ctx context.Context, req *pb.CreateTradeRequest) (*pb.TradeMessage, error) {
	dbTrade := fromCreateTrade(req)
	if err := repo.db.WithContext(ctx).Create(dbTrade).Error; err != nil {
		return nil, err
	}
	return toTradeProto(dbTrade), nil
}

func (repo *TradeRepository) GetByID(ctx context.Context, id string) (*pb.TradeMessage, error) {
	return firstOptional(repo.db.WithContext(ctx).Where(q(repository.ColID)+" = ?", id), toTradeProto)
}

func fromTradeMessage(msg *pb.TradeMessage) *tradeModel {
	return &tradeModel{
		Id:                  parseUUID(msg.Id),
		AccountId:           parseUUID(msg.AccountId),
		InstrumentId:        parseUUID(msg.InstrumentId),
		Direction:           msg.Direction,
		Quantity:            msg.Quantity,
		EntryPrice:          msg.EntryPrice,
		TimestampOpen:       msg.TimestampOpen.AsTime(),
		TimestampClose:      optionalTime(msg.TimestampClose),
		TradeClosed:         msg.TradeClosed,
		TransactionHappened: msg.TransactionHappened,
		Status:              msg.Status,
	}
}

func (repo *TradeRepository) Update(ctx context.Context, msg *pb.TradeMessage) (*pb.TradeMessage, error) {
	m := fromTradeMessage(msg)
	if err := repo.db.WithContext(ctx).Save(m).Error; err != nil {
		return nil, err
	}
	return toTradeProto(m), nil
}

func (repo *TradeRepository) GetOpen(ctx context.Context) ([]*pb.TradeMessage, error) {
	return findAll(repo.db.WithContext(ctx).Where(q(repository.ColTradeClosed)+" = ?", false), toTradeProto)
}

func (repo *TradeRepository) GetExpired(ctx context.Context) ([]*pb.TradeMessage, error) {
	return findAll(
		repo.db.WithContext(ctx).
			Where(q(repository.ColTradeClosed)+" = ?", false).
			Where(q(repository.ColTimestampClose)+" IS NOT NULL AND "+q(repository.ColTimestampClose)+" < ?", time.Now()),
		toTradeProto,
	)
}

func (repo *TradeRepository) GetByAccount(ctx context.Context, accountID string, onlyOpen, onlyLong bool) ([]*pb.TradeMessage, error) {
	query := repo.db.WithContext(ctx).Where(q(repository.ColAccountID)+" = ?", accountID)
	if onlyOpen {
		query = query.Where(q(repository.ColTradeClosed)+" = ?", false)
	}
	if onlyLong {
		query = query.Where(q(repository.ColDirection)+" IN (?, ?)", repository.DirectionLongBuy, repository.DirectionLongSell)
	}
	return findAll(query, toTradeProto)
}

func (repo *TradeRepository) DeleteOlderThan(ctx context.Context, date time.Time) (int32, error) {
	return affectedRows(repo.db.WithContext(ctx).Where(q(repository.ColTimestampOpen)+" < ?", date).Delete(&tradeModel{}))
}
