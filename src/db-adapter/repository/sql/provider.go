package sql

import (
	"context"
	"fmt"
	"net/url"

	"github.com/dynatrace/easytrade/dbadapter/config"
	"github.com/dynatrace/easytrade/dbadapter/db"
	"github.com/dynatrace/easytrade/dbadapter/repository"
	"gorm.io/driver/postgres"
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

	var dialector gorm.Dialector
	switch cfg.Type {
	case "postgres":
		dialector = postgres.Open(cfg.Url)
	case "mssql":
		dialector = sqlserver.Open(withGuidConversion(cfg.Url))
	default:
		return nil, fmt.Errorf("unsupported database type: %q", cfg.Type)
	}

	opts := db.ConnectOptions{
		Timeout:       cfg.ConnectTimeout,
		RetryInterval: cfg.RetryInterval,
	}
	gormDB, err := db.Connect(context.Background(), opts, func() (*gorm.DB, error) {
		return gorm.Open(dialector, &gorm.Config{NamingStrategy: dbNamer{}})
	})
	if err != nil {
		return nil, err
	}
	return newSQLRepository(gormDB), nil
}

// Add "guid conversion=true" so SQL Server UNIQUEIDENTIFIER values can be scanned into uuid.UUID
func withGuidConversion(raw string) string {
	u, err := url.Parse(raw)
	if err != nil {
		return raw
	}
	query := u.Query()
	query.Set("guid conversion", "true")
	u.RawQuery = query.Encode()
	return u.String()
}

func init() {
	repository.Register("mssql", Provider{})
	repository.Register("postgres", Provider{})
}
