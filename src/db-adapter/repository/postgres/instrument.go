package postgres

import (
	"context"
	"time"

	"github.com/dynatrace/easytrade/dbadapter/models"
	"github.com/dynatrace/easytrade/dbadapter/repository"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type instrumentModel struct {
	Id          *uuid.UUID `gorm:"primaryKey;default:gen_random_uuid()"`
	ProductId   *uuid.UUID
	Code        string
	Name        string
	Description string
}

func (instrumentModel) TableName() string { return repository.TableInstruments }

type ownedInstrumentModel struct {
	Id                   *uuid.UUID `gorm:"primaryKey;default:gen_random_uuid()"`
	AccountId            *uuid.UUID
	InstrumentId         *uuid.UUID
	Quantity             float64
	LastModificationDate time.Time
}

func (ownedInstrumentModel) TableName() string { return repository.TableOwnedInstruments }

func toInstrument(src *instrumentModel) *models.Instrument {
	return &models.Instrument{
		ID:          uuidString(src.Id),
		ProductID:   uuidString(src.ProductId),
		Code:        src.Code,
		Name:        src.Name,
		Description: src.Description,
	}
}

func toOwnedInstrument(src *ownedInstrumentModel) *models.OwnedInstrument {
	return &models.OwnedInstrument{
		ID:                   uuidString(src.Id),
		AccountID:            uuidString(src.AccountId),
		InstrumentID:         uuidString(src.InstrumentId),
		Quantity:             src.Quantity,
		LastModificationDate: src.LastModificationDate,
	}
}

func fromOwnedInstrument(owned *models.OwnedInstrument) *ownedInstrumentModel {
	return &ownedInstrumentModel{
		Id:                   parseUUID(owned.ID),
		AccountId:            parseUUID(owned.AccountID),
		InstrumentId:         parseUUID(owned.InstrumentID),
		Quantity:             owned.Quantity,
		LastModificationDate: owned.LastModificationDate,
	}
}

var _ models.InstrumentRepository = (*InstrumentRepository)(nil)

type InstrumentRepository struct{ db *gorm.DB }

func NewInstrumentRepository(db *gorm.DB) models.InstrumentRepository {
	return &InstrumentRepository{db: db}
}

func (repo *InstrumentRepository) GetByID(ctx context.Context, id string) (*models.Instrument, error) {
	return firstOptional(repo.db.WithContext(ctx).Where(q(repository.ColID)+" = ?", id), toInstrument)
}

func (repo *InstrumentRepository) GetAll(ctx context.Context) ([]*models.Instrument, error) {
	return findAll(repo.db.WithContext(ctx), toInstrument)
}

func (repo *InstrumentRepository) GetOwned(ctx context.Context, accountID, instrumentID string) (*models.OwnedInstrument, error) {
	return firstOptional(
		repo.db.WithContext(ctx).
			Where(q(repository.ColAccountID)+" = ?", accountID).
			Where(q(repository.ColInstrumentID)+" = ?", instrumentID),
		toOwnedInstrument,
	)
}

func (repo *InstrumentRepository) GetAllOwned(ctx context.Context, accountID string) ([]*models.OwnedInstrument, error) {
	return findAll(repo.db.WithContext(ctx).Where(q(repository.ColAccountID)+" = ?", accountID), toOwnedInstrument)
}

func (repo *InstrumentRepository) AddOwned(ctx context.Context, owned *models.OwnedInstrument) (*models.OwnedInstrument, error) {
	dbOwned := fromOwnedInstrument(owned)
	if err := repo.db.WithContext(ctx).Create(dbOwned).Error; err != nil {
		return nil, err
	}
	return toOwnedInstrument(dbOwned), nil
}

func (repo *InstrumentRepository) UpdateOwned(ctx context.Context, owned *models.OwnedInstrument) (*models.OwnedInstrument, error) {
	dbOwned := fromOwnedInstrument(owned)
	if err := repo.db.WithContext(ctx).Save(dbOwned).Error; err != nil {
		return nil, err
	}
	return toOwnedInstrument(dbOwned), nil
}
