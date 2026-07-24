package repository

type CompositeRepository interface {
	Account() AccountRepository
	Balance() BalanceRepository
	CreditCard() CreditCardOrderRepository
	Instrument() InstrumentRepository
	Package() PackageRepository
	Pricing() PricingRepository
	Product() ProductRepository
	Trade() TradeRepository
}
