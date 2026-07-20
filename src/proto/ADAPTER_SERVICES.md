## Database Adapter Operations

| Adapter | Methods | Operations | Consuming Services |
|---|---|---|---|
| **AccountService** | 5 | 1. CreateAccount 2.GetAccountByUsername 3. GetAccountById 4. GetAccounts 5. DeleteAccountsOlderThan | Account, Login, Manager, Content-Creator |
| **BalanceService** | 5 | 1. CreateBalance 2. GetBalanceByAccountId 3. UpdateBalance 4. AddBalanceHistory 5. DeleteBalanceHistoryOlderThan | Broker, Login, Content-Creator |
| **ProductService** | 1 | 1. GetProducts | Broker, Manager |
| **PackageService** | 1 | 1. GetPackages | Manager |
| **InstrumentService** | 6 | 1. GetInstrumentById 2. GetAllInstruments 3. GetOwnedInstrument 4. GetOwnedInstruments [Get all owned instruments for an account] 5. AddOwnedInstrument 6. UpdateOwnedInstrument | Broker |
| **TradeService** | 6 | 1. CreateTrade 2. UpdateTrade 3. GetOpenTrades 4. GetExpiredTrades [Get expired open trades] 5. GetAccountTrades [Get all trades for a specific account with optional filters] 6. DeleteTradesOlderThan | Broker, Content-Creator |
| **CreditCardOrderService** | 9 | 1. CreateCreditCardOrder 2. GetShippingAddressByOrderId 3. GetStatusListByAccountId [Get all order statuses by timestamp DESC] 4. GetLastOrderStatusByAccountId 5. GetOrdersToManufacture 6. InsertNewStatus 7. InsertNewCreditCard 8. UpdateOrderShippingId 9. DeleteOrdersByAccountId | Credit-Card |
| **PricingService** | 5 | 1. GetLatestPrices 2. GetLatestPriceForInstrument 3. GetPricesForInstrument 4. InsertPricesBatch 5. DeletePricesOlderThan | Pricing, Content-Creator |
| **TOTAL** | **38** | | |

---
