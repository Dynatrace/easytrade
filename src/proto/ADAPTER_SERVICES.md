## Database Adapter Operations

| Adapter | Operations | Consuming Services |
|---|---|---|
| **AccountService** | 1. CreateAccount 2.GetAccountByUsername 3. GetAccountById 4. GetAccounts 5. DeleteAccountsOlderThan | user-service, background-service |
| **BalanceService** | 1. CreateBalance 2. GetBalanceByAccountId 3. UpdateBalance 4. AddBalanceHistory 5. DeleteBalanceHistoryOlderThan | broker-service, background-service |
| **ProductService** | 1. GetProducts 2. GetProductById | broker-service, offer-service |
| **PackageService** | 1. GetPackages | offer-service |
| **InstrumentService** | 1. GetInstrumentById 2. GetAllInstruments 3. GetOwnedInstrument 4. GetOwnedInstruments [Get all owned instruments for an account] 5. AddOwnedInstrument 6. UpdateOwnedInstrument | broker-service |
| **TradeService** | 1. CreateTrade 2. UpdateTrade 3. GetOpenTrades 4. GetExpiredTrades [Get expired open trades] 5. GetAccountTrades [Get all trades for a specific account with optional filters] 6. DeleteTradesOlderThan | broker-service, background-service |
| **CreditCardOrderService** | 1. CreateCreditCardOrder 2. GetShippingAddressByOrderId 3. GetStatusListByAccountId [Get all order statuses by timestamp DESC] 4. GetLastOrderStatusByAccountId 5. GetLastOrderStatusByOrderId 6. GetOrdersToManufacture 7. InsertNewStatus 8. InsertNewCreditCard 9. UpdateOrderShippingId 10. DeleteOrdersByAccountId 11. ExistsByAccountId | credit-card-order-service |
| **PricingService** | 1. GetLatestPrices 2. GetLatestPriceForInstrument 3. GetPricesForInstrument 4. InsertPricesBatch 5. DeletePricesOlderThan | pricing-service, background-service |

---
