package postgres

import (
	"github.com/dynatrace/easytrade/dbadapter/models"
	"github.com/dynatrace/easytrade/dbadapter/repository"
	"gorm.io/gorm"
)

type PostgresRepository struct {
	account    models.AccountRepository
	balance    models.BalanceRepository
	creditCard models.CreditCardOrderRepository
	instrument models.InstrumentRepository
	pkg        models.PackageRepository
	pricing    models.PricingRepository
	product    models.ProductRepository
	trade      models.TradeRepository
}

func NewPostgresRepository(db *gorm.DB) repository.CompositeRepository {
	return &PostgresRepository{
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

func (r *PostgresRepository) Account() models.AccountRepository            { return r.account }
func (r *PostgresRepository) Balance() models.BalanceRepository            { return r.balance }
func (r *PostgresRepository) CreditCard() models.CreditCardOrderRepository { return r.creditCard }
func (r *PostgresRepository) Instrument() models.InstrumentRepository      { return r.instrument }
func (r *PostgresRepository) Package() models.PackageRepository            { return r.pkg }
func (r *PostgresRepository) Pricing() models.PricingRepository            { return r.pricing }
func (r *PostgresRepository) Product() models.ProductRepository            { return r.product }
func (r *PostgresRepository) Trade() models.TradeRepository                { return r.trade }

var _ repository.CompositeRepository = (*PostgresRepository)(nil)
