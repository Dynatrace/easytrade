package mssql

import (
	"github.com/dynatrace/easytrade/dbadapter/models"
	"github.com/dynatrace/easytrade/dbadapter/repository"
	"gorm.io/gorm"
)

type MSSQLRepository struct {
	account    models.AccountRepository
	balance    models.BalanceRepository
	creditCard models.CreditCardOrderRepository
	instrument models.InstrumentRepository
	pkg        models.PackageRepository
	pricing    models.PricingRepository
	product    models.ProductRepository
	trade      models.TradeRepository
}

func NewMSSQLRepository(db *gorm.DB) repository.CompositeRepository {
	return &MSSQLRepository{
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

func (r *MSSQLRepository) Account() models.AccountRepository            { return r.account }
func (r *MSSQLRepository) Balance() models.BalanceRepository            { return r.balance }
func (r *MSSQLRepository) CreditCard() models.CreditCardOrderRepository { return r.creditCard }
func (r *MSSQLRepository) Instrument() models.InstrumentRepository      { return r.instrument }
func (r *MSSQLRepository) Package() models.PackageRepository            { return r.pkg }
func (r *MSSQLRepository) Pricing() models.PricingRepository            { return r.pricing }
func (r *MSSQLRepository) Product() models.ProductRepository            { return r.product }
func (r *MSSQLRepository) Trade() models.TradeRepository                { return r.trade }

var _ repository.CompositeRepository = (*MSSQLRepository)(nil)
