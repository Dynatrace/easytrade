package sql

import (
	"errors"
	"time"

	"github.com/dynatrace/easytrade/dbadapter/repository"
	"github.com/google/uuid"
	"google.golang.org/protobuf/types/known/timestamppb"
	"gorm.io/gorm"
)

func q(id string) string { return `"` + id + `"` }

func qcol(table, col string) string { return q(table) + "." + q(col) }

func parseUUID(str string) *uuid.UUID {
	if str == "" {
		return nil
	}
	u, err := uuid.Parse(str)
	if err != nil {
		return nil
	}
	return &u
}

func uuidString(id *uuid.UUID) string {
	if id == nil {
		return ""
	}
	return id.String()
}

func optionalTime(ts *timestamppb.Timestamp) *time.Time {
	if ts == nil {
		return nil
	}
	t := ts.AsTime()
	return &t
}

func firstOptional[M, T any](query *gorm.DB, mapper func(*M) *T) (*T, error) {
	var item M
	switch err := query.First(&item).Error; {
	case errors.Is(err, gorm.ErrRecordNotFound):
		return nil, repository.ErrNotFound
	case err != nil:
		return nil, err
	default:
		return mapper(&item), nil
	}
}

func affectedRows(query *gorm.DB) (int32, error) {
	return int32(query.RowsAffected), query.Error
}

func findAll[M, T any](query *gorm.DB, mapper func(*M) *T) ([]*T, error) {
	var items []M
	if err := query.Find(&items).Error; err != nil {
		return nil, err
	}
	return mapSlice(items, mapper), nil
}

func mapSlice[M, T any](items []M, mapper func(*M) *T) []*T {
	out := make([]*T, len(items))
	for i := range items {
		out[i] = mapper(&items[i])
	}
	return out
}
