package repository

import (
	"github.com/dynatrace/easytrade/dbadapter/models"
)

type CompositeRepository interface {
	Account() models.AccountRepository
	Balance() models.BalanceRepository
	CreditCard() models.CreditCardOrderRepository
	Instrument() models.InstrumentRepository
	Package() models.PackageRepository
	Pricing() models.PricingRepository
	Product() models.ProductRepository
	Trade() models.TradeRepository
}
