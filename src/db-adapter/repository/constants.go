package repository

const (
	TableAccounts              = "Accounts"
	TableBalances              = "Balance"
	TableBalanceHistory        = "Balancehistory"
	TableCreditCardOrders      = "CreditCardOrders"
	TableCreditCardOrderStatus = "CreditCardOrderStatus"
	TableCreditCards           = "CreditCards"
	TableInstruments           = "Instruments"
	TableOwnedInstruments      = "Ownedinstruments"
	TablePackages              = "Packages"
	TablePrices                = "Pricing"
	TableProducts              = "Products"
	TableTrades                = "Trades"
)

const (
	ColID                = "Id"
	ColAccountID         = "AccountId"
	ColInstrumentID      = "InstrumentId"
	ColCreditCardOrderID = "CreditCardOrderId"
	ColUsername          = "Username"
	ColOrigin            = "Origin"
	ColCreationDate      = "CreationDate"
	ColActionDate        = "ActionDate"
	ColTimestamp         = "Timestamp"
	ColStatus            = "Status"
	ColDirection         = "Direction"
	ColTradeClosed       = "TradeClosed"
	ColTimestampOpen     = "TimestampOpen"
	ColTimestampClose    = "TimestampClose"
)

const (
	StatusOrderCreated = "order_created"
)
