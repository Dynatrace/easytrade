package sql

import (
	"github.com/dynatrace/easytrade/dbadapter/repository"
	"gorm.io/gorm"
)

type sqlRepository struct {
	account    repository.AccountRepository
	balance    repository.BalanceRepository
	creditCard repository.CreditCardOrderRepository
	instrument repository.InstrumentRepository
	pkg        repository.PackageRepository
	pricing    repository.PricingRepository
	product    repository.ProductRepository
	trade      repository.TradeRepository
}

var _ repository.CompositeRepository = (*sqlRepository)(nil)

func newSQLRepository(db *gorm.DB) repository.CompositeRepository {
	return &sqlRepository{
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

func (r *sqlRepository) Account() repository.AccountRepository            { return r.account }
func (r *sqlRepository) Balance() repository.BalanceRepository            { return r.balance }
func (r *sqlRepository) CreditCard() repository.CreditCardOrderRepository { return r.creditCard }
func (r *sqlRepository) Instrument() repository.InstrumentRepository      { return r.instrument }
func (r *sqlRepository) Package() repository.PackageRepository            { return r.pkg }
func (r *sqlRepository) Pricing() repository.PricingRepository            { return r.pricing }
func (r *sqlRepository) Product() repository.ProductRepository            { return r.product }
func (r *sqlRepository) Trade() repository.TradeRepository                { return r.trade }
