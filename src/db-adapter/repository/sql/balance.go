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

type balanceModel struct {
	AccountId *uuid.UUID `gorm:"primaryKey;default:(-)"`
	Value     float64
}

func (balanceModel) TableName() string { return repository.TableBalances }

type balanceHistoryModel struct {
	Id          *uuid.UUID `gorm:"primaryKey;default:(-)"`
	AccountId   *uuid.UUID
	OldValue    float64
	ValueChange float64
	ActionType  string
	ActionDate  time.Time
}

func (balanceHistoryModel) TableName() string { return repository.TableBalanceHistory }

func toBalanceProto(src *balanceModel) *pb.BalanceMessage {
	return &pb.BalanceMessage{AccountId: uuidString(src.AccountId), Value: src.Value}
}

func fromAddBalanceHistory(req *pb.AddBalanceHistoryRequest) *balanceHistoryModel {
	return &balanceHistoryModel{
		AccountId:   parseUUID(req.AccountId),
		OldValue:    req.OldValue,
		ValueChange: req.ValueChange,
		ActionType:  req.ActionType,
		ActionDate:  req.ActionDate.AsTime(),
	}
}

func toBalanceHistoryProto(src *balanceHistoryModel) *pb.BalanceHistoryMessage {
	return &pb.BalanceHistoryMessage{
		Id:          uuidString(src.Id),
		AccountId:   uuidString(src.AccountId),
		OldValue:    src.OldValue,
		ValueChange: src.ValueChange,
		ActionType:  src.ActionType,
		ActionDate:  timestamppb.New(src.ActionDate),
	}
}

var _ repository.BalanceRepository = (*BalanceRepository)(nil)

type BalanceRepository struct{ db *gorm.DB }

func NewBalanceRepository(db *gorm.DB) repository.BalanceRepository {
	return &BalanceRepository{db: db}
}

func (repo *BalanceRepository) Create(ctx context.Context, req *pb.CreateBalanceRequest) (*pb.BalanceMessage, error) {
	dbBalance := &balanceModel{AccountId: parseUUID(req.AccountId), Value: req.Value}
	if err := repo.db.WithContext(ctx).Create(dbBalance).Error; err != nil {
		return nil, err
	}
	return toBalanceProto(dbBalance), nil
}

func (repo *BalanceRepository) GetByAccountID(ctx context.Context, accountID string) (*pb.BalanceMessage, error) {
	return firstOptional(repo.db.WithContext(ctx).Where(q(repository.ColAccountID)+" = ?", accountID), toBalanceProto)
}

func fromBalanceMessage(msg *pb.BalanceMessage) *balanceModel {
	return &balanceModel{
		AccountId: parseUUID(msg.AccountId),
		Value:     msg.Value,
	}
}

func (repo *BalanceRepository) Update(ctx context.Context, msg *pb.BalanceMessage) (*pb.BalanceMessage, error) {
	m := fromBalanceMessage(msg)
	if err := repo.db.WithContext(ctx).Save(m).Error; err != nil {
		return nil, err
	}
	return toBalanceProto(m), nil
}

func (repo *BalanceRepository) AddHistory(ctx context.Context, req *pb.AddBalanceHistoryRequest) (*pb.BalanceHistoryMessage, error) {
	dbHistory := fromAddBalanceHistory(req)
	if err := repo.db.WithContext(ctx).Create(dbHistory).Error; err != nil {
		return nil, err
	}
	return toBalanceHistoryProto(dbHistory), nil
}

func (repo *BalanceRepository) DeleteHistoryOlderThan(ctx context.Context, date time.Time) (int32, error) {
	return affectedRows(repo.db.WithContext(ctx).Where(q(repository.ColActionDate)+" < ?", date).Delete(&balanceHistoryModel{}))
}
