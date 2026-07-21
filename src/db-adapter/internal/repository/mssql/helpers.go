package mssql

import (
	"errors"

	"gorm.io/gorm"
)

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
		return nil, nil
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
