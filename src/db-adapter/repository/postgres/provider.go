package postgres

import (
	"context"
	"fmt"

	"github.com/dynatrace/easytrade/dbadapter/config"
	"github.com/dynatrace/easytrade/dbadapter/db"
	"github.com/dynatrace/easytrade/dbadapter/repository"
	"gorm.io/driver/postgres"
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
		return gorm.Open(postgres.Open(cfg.Url), &gorm.Config{NamingStrategy: dbNamer{}})
	})
	if err != nil {
		return nil, err
	}
	return NewPostgresRepository(gormDB), nil
}

func init() {
	repository.Register("postgres", Provider{})
}
