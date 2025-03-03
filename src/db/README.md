# easyTradeDb

MSSQL database service

## Technologies used

- Docker
- MSSQL
- Bash scripts
- JSON

## Local build instructions

```bash
# by default db will start on port 1433

docker build -t easytradedb .
docker run -d --name db easytradedb

# running with default password passed in ENV
docker run -d --env SA_PASSWORD=yourStrong(!)Password --name db easytradedb
```

If you want the service to work properly, you should try setting these ENV variables:

| Name        | Description           | Default               |
| ----------- | --------------------- | --------------------- |
| SA_PASSWORD | the database password | yourStrong(!)Password |

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
