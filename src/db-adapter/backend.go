package main

import (
	"fmt"

	"github.com/dynatrace/easytrade/dbadapter/config"
	"github.com/dynatrace/easytrade/dbadapter/repository"
	sqlrepo "github.com/dynatrace/easytrade/dbadapter/repository/sql"
)

func newDBBackend(cfg config.DatabaseConfig) (repository.DBBackend, error) {
	switch cfg.Type {
	case "postgres":
		return sqlrepo.NewPostgresBackend(cfg)
	case "mssql":
		return sqlrepo.NewMSSQLBackend(cfg)
	default:
		return nil, fmt.Errorf("unsupported database type: %q", cfg.Type)
	}
}
