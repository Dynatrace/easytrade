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

type Balance struct {
	AccountId *uuid.UUID `gorm:"primaryKey;default:(-)"`
	Value     float64
}

type BalanceHistory struct {
	Id          *uuid.UUID `gorm:"primaryKey;default:(-)"`
	AccountId   *uuid.UUID
	OldValue    float64
	ValueChange float64
	ActionType  string
	ActionDate  time.Time
}

func (Balance) TableName() string        { return repository.TableBalances }
func (BalanceHistory) TableName() string { return repository.TableBalanceHistory }

var _ repository.BalanceRepository = (*BalanceRepository)(nil)

type BalanceRepository struct{ db *gorm.DB }

func NewBalanceRepository(db *gorm.DB) repository.BalanceRepository {
	return &BalanceRepository{db: db}
}

func (repo *BalanceRepository) GetByAccountID(ctx context.Context, accountID string) (*pb.BalanceMessage, error) {
	return firstOptional(repo.db.WithContext(ctx).Where(q(repository.ColAccountID)+" = ?", accountID), (*Balance).toProto)
}

func (repo *BalanceRepository) Create(ctx context.Context, req *pb.CreateBalanceRequest) (*pb.BalanceMessage, error) {
	dbBalance := &Balance{AccountId: parseUUID(req.AccountId), Value: req.Value}
	if err := repo.db.WithContext(ctx).Create(dbBalance).Error; err != nil {
		return nil, err
	}
	return dbBalance.toProto(), nil
}

func (repo *BalanceRepository) Update(ctx context.Context, msg *pb.BalanceMessage) (*pb.BalanceMessage, error) {
	m := balanceFromProto(msg)
	if err := repo.db.WithContext(ctx).Save(m).Error; err != nil {
		return nil, err
	}
	return m.toProto(), nil
}

func (repo *BalanceRepository) AddHistory(ctx context.Context, req *pb.AddBalanceHistoryRequest) (*pb.BalanceHistoryMessage, error) {
	dbHistory := balanceHistoryFromProto(req)
	if err := repo.db.WithContext(ctx).Create(dbHistory).Error; err != nil {
		return nil, err
	}
	return dbHistory.toProto(), nil
}

func (repo *BalanceRepository) DeleteHistoryOlderThan(ctx context.Context, date time.Time) (int32, error) {
	return affectedRows(repo.db.WithContext(ctx).Where(q(repository.ColActionDate)+" < ?", date).Delete(&BalanceHistory{}))
}

func balanceFromProto(msg *pb.BalanceMessage) *Balance {
	return &Balance{
		AccountId: parseUUID(msg.AccountId),
		Value:     msg.Value,
	}
}

func (src *Balance) toProto() *pb.BalanceMessage {
	return &pb.BalanceMessage{AccountId: uuidString(src.AccountId), Value: src.Value}
}

func balanceHistoryFromProto(req *pb.AddBalanceHistoryRequest) *BalanceHistory {
	return &BalanceHistory{
		AccountId:   parseUUID(req.AccountId),
		OldValue:    req.OldValue,
		ValueChange: req.ValueChange,
		ActionType:  req.ActionType,
		ActionDate:  req.ActionDate.AsTime(),
	}
}

func (src *BalanceHistory) toProto() *pb.BalanceHistoryMessage {
	return &pb.BalanceHistoryMessage{
		Id:          uuidString(src.Id),
		AccountId:   uuidString(src.AccountId),
		OldValue:    src.OldValue,
		ValueChange: src.ValueChange,
		ActionType:  src.ActionType,
		ActionDate:  timestamppb.New(src.ActionDate),
	}
}
