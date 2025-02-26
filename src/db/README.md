# easyTradeDb

MSSQL database service

## Technologies used

- Docker
- MSSQL
- Bash scripts
- JSON

## Logic

### DB initialization

---

The MSSQL is initialized with:

| Item            | Value/Info                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------ |
| User            | sa                                                                                                           |
| User's password | yourStrong(!)Password                                                                                        |
| Database        | TradeManagement                                                                                              |
| Tables          | Accounts -> around 100 rows                                                                                  |
|                 | BalanceHistory -> around 13000 rows                                                                          |
|                 | Balance -> around 100 rows                                                                                   |
|                 | Instruments -> 15 rows                                                                                       |
|                 | OwnedInstruments -> around 1500 rows                                                                         |
|                 | Packages and Products -> 3 rows each                                                                         |
|                 | Trades -> some initial trade data, around 13000 rows                                                         |
|                 | Pricing -> starts up empty, but gets filled with around 21000 rows by ContentCreator service after it starts |
