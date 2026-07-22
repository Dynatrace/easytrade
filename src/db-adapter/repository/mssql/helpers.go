package mssql

import (
	"errors"
	"strings"

	"github.com/dynatrace/easytrade/dbadapter/repository"
	"github.com/google/uuid"
	mssql "github.com/microsoft/go-mssqldb"
	"gorm.io/gorm"
)

func uuidString(uuid mssql.UniqueIdentifier) string {
	return strings.ToLower(uuid.String())
}

func parseUUID(str string) mssql.UniqueIdentifier {
	var u mssql.UniqueIdentifier
	_ = u.Scan(str)
	return u
}

func newIfEmpty(str string) mssql.UniqueIdentifier {
	if str == "" {
		return mssql.UniqueIdentifier(uuid.New())
	}
	return parseUUID(str)
}

func mapSlice[M, T any](items []M, mapper func(*M) *T) []*T {
	out := make([]*T, len(items))
	for i := range items {
		out[i] = mapper(&items[i])
	}
	return out
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

func findAll[M, T any](query *gorm.DB, mapper func(*M) *T) ([]*T, error) {
	var items []M
	if err := query.Find(&items).Error; err != nil {
		return nil, err
	}
	return mapSlice(items, mapper), nil
}

func affectedRows(query *gorm.DB) (int32, error) {
	return int32(query.RowsAffected), query.Error
}
