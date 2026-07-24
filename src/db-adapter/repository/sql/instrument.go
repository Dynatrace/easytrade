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

type instrumentModel struct {
	Id          *uuid.UUID `gorm:"primaryKey;default:(-)"`
	ProductId   *uuid.UUID
	Code        string
	Name        string
	Description string
}

func (instrumentModel) TableName() string { return repository.TableInstruments }

type ownedInstrumentModel struct {
	Id                   *uuid.UUID `gorm:"primaryKey;default:(-)"`
	AccountId            *uuid.UUID
	InstrumentId         *uuid.UUID
	Quantity             float64
	LastModificationDate time.Time
}

func (ownedInstrumentModel) TableName() string { return repository.TableOwnedInstruments }

func toInstrumentProto(src *instrumentModel) *pb.InstrumentMessage {
	return &pb.InstrumentMessage{
		Id:          uuidString(src.Id),
		ProductId:   uuidString(src.ProductId),
		Code:        src.Code,
		Name:        src.Name,
		Description: src.Description,
	}
}

func toOwnedProto(src *ownedInstrumentModel) *pb.OwnedInstrumentMessage {
	return &pb.OwnedInstrumentMessage{
		Id:                   uuidString(src.Id),
		AccountId:            uuidString(src.AccountId),
		InstrumentId:         uuidString(src.InstrumentId),
		Quantity:             src.Quantity,
		LastModificationDate: timestamppb.New(src.LastModificationDate),
	}
}

func fromAddOwned(req *pb.AddOwnedInstrumentRequest) *ownedInstrumentModel {
	return &ownedInstrumentModel{
		AccountId:            parseUUID(req.AccountId),
		InstrumentId:         parseUUID(req.InstrumentId),
		Quantity:             req.Quantity,
		LastModificationDate: req.LastModificationDate.AsTime(),
	}
}

var _ repository.InstrumentRepository = (*InstrumentRepository)(nil)

type InstrumentRepository struct{ db *gorm.DB }

func NewInstrumentRepository(db *gorm.DB) repository.InstrumentRepository {
	return &InstrumentRepository{db: db}
}

func (repo *InstrumentRepository) GetByID(ctx context.Context, id string) (*pb.InstrumentMessage, error) {
	return firstOptional(repo.db.WithContext(ctx).Where(q(repository.ColID)+" = ?", id), toInstrumentProto)
}

func (repo *InstrumentRepository) GetAll(ctx context.Context) ([]*pb.InstrumentMessage, error) {
	return findAll(repo.db.WithContext(ctx), toInstrumentProto)
}

func (repo *InstrumentRepository) GetOwned(ctx context.Context, accountID, instrumentID string) (*pb.OwnedInstrumentMessage, error) {
	return firstOptional(
		repo.db.WithContext(ctx).
			Where(q(repository.ColAccountID)+" = ?", accountID).
			Where(q(repository.ColInstrumentID)+" = ?", instrumentID),
		toOwnedProto,
	)
}

func (repo *InstrumentRepository) GetAllOwned(ctx context.Context, accountID string) ([]*pb.OwnedInstrumentMessage, error) {
	return findAll(repo.db.WithContext(ctx).Where(q(repository.ColAccountID)+" = ?", accountID), toOwnedProto)
}

func (repo *InstrumentRepository) AddOwned(ctx context.Context, req *pb.AddOwnedInstrumentRequest) (*pb.OwnedInstrumentMessage, error) {
	dbOwned := fromAddOwned(req)
	if err := repo.db.WithContext(ctx).Create(dbOwned).Error; err != nil {
		return nil, err
	}
	return toOwnedProto(dbOwned), nil
}

func fromOwnedMessage(msg *pb.OwnedInstrumentMessage) *ownedInstrumentModel {
	return &ownedInstrumentModel{
		Id:                   parseUUID(msg.Id),
		AccountId:            parseUUID(msg.AccountId),
		InstrumentId:         parseUUID(msg.InstrumentId),
		Quantity:             msg.Quantity,
		LastModificationDate: msg.LastModificationDate.AsTime(),
	}
}

func (repo *InstrumentRepository) UpdateOwned(ctx context.Context, msg *pb.OwnedInstrumentMessage) (*pb.OwnedInstrumentMessage, error) {
	m := fromOwnedMessage(msg)
	if err := repo.db.WithContext(ctx).Save(m).Error; err != nil {
		return nil, err
	}
	return toOwnedProto(m), nil
}
