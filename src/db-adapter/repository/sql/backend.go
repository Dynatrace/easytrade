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

type sqlBackend struct {
	account    repository.AccountRepository
	balance    repository.BalanceRepository
	creditCard repository.CreditCardOrderRepository
	instrument repository.InstrumentRepository
	pkg        repository.PackageRepository
	pricing    repository.PricingRepository
	product    repository.ProductRepository
	trade      repository.TradeRepository
}

var _ repository.DBBackend = (*sqlBackend)(nil)

func newSQLBackend(db *gorm.DB) repository.DBBackend {
	return &sqlBackend{
		account:    NewAccountRepository(db),
		balance:    NewBalanceRepository(db),
		creditCard: NewCreditCardOrderRepository(db),
		instrument: NewInstrumentRepository(db),
		pkg:        NewPackageRepository(db),
		pricing:    NewPricingRepository(db),
		product:    NewProductRepository(db),
		trade:      NewTradeRepository(db),
	}
}

func (r *sqlBackend) Account() repository.AccountRepository            { return r.account }
func (r *sqlBackend) Balance() repository.BalanceRepository            { return r.balance }
func (r *sqlBackend) CreditCard() repository.CreditCardOrderRepository { return r.creditCard }
func (r *sqlBackend) Instrument() repository.InstrumentRepository      { return r.instrument }
func (r *sqlBackend) Package() repository.PackageRepository            { return r.pkg }
func (r *sqlBackend) Pricing() repository.PricingRepository            { return r.pricing }
func (r *sqlBackend) Product() repository.ProductRepository            { return r.product }
func (r *sqlBackend) Trade() repository.TradeRepository                { return r.trade }

type dbNamer struct{ schema.NamingStrategy }

func (dbNamer) ColumnName(_, column string) string { return column }

func NewPostgresBackend(cfg config.DatabaseConfig) (repository.DBBackend, error) {
	return newBackend(cfg, postgres.Open(cfg.Url))
}

func NewMSSQLBackend(cfg config.DatabaseConfig) (repository.DBBackend, error) {
	return newBackend(cfg, sqlserver.Open(withGuidConversion(cfg.Url)))
}

func newBackend(cfg config.DatabaseConfig, dialector gorm.Dialector) (repository.DBBackend, error) {
	if cfg.Url == "" {
		return nil, fmt.Errorf("DB_URL is not set")
	}
	gormDB, err := db.Connect(context.Background(), db.ConnectOptions{
		Timeout:       cfg.ConnectTimeout,
		RetryInterval: cfg.RetryInterval,
	}, func() (*gorm.DB, error) {
		return gorm.Open(dialector, &gorm.Config{NamingStrategy: dbNamer{}})
	})
	if err != nil {
		return nil, err
	}
	return newSQLBackend(gormDB), nil
}

// Add "guid conversion=true" so SQL Server UNIQUEIDENTIFIER values can be scanned into uuid.UUID
func withGuidConversion(raw string) string {
	dbUrl, err := url.Parse(raw)
	if err != nil {
		return raw
	}
	query := dbUrl.Query()
	query.Set("guid conversion", "true")
	dbUrl.RawQuery = query.Encode()
	return dbUrl.String()
}
