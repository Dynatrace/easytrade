package mssql

import (
	"context"
	"fmt"

	"github.com/dynatrace/easytrade/dbadapter/internal/config"
	"github.com/dynatrace/easytrade/dbadapter/internal/db"
	"github.com/dynatrace/easytrade/dbadapter/internal/repository"
	"gorm.io/driver/sqlserver"
	"gorm.io/gorm"
	"gorm.io/gorm/schema"
)

type dbNamer struct{ schema.NamingStrategy }

func (dbNamer) ColumnName(_, column string) string { return column }

type Provider struct{}

var _ repository.Provider = Provider{}

func (Provider) Connect(cfg config.DatabaseConfig) (repository.CompositeRepository, error) {
	if cfg.Url == "" {
		return nil, fmt.Errorf("DB_URL is not set")
	}
	opts := db.ConnectOptions{
		Timeout:       cfg.ConnectTimeout,
		RetryInterval: cfg.RetryInterval,
	}
	gormDB, err := db.Connect(context.Background(), opts, func() (*gorm.DB, error) {
		return gorm.Open(sqlserver.Open(cfg.Url), &gorm.Config{NamingStrategy: dbNamer{}})
	})
	if err != nil {
		return nil, err
	}
	return NewMSSQLRepository(gormDB), nil
}

func init() {
	repository.Register("mssql", Provider{})
}
