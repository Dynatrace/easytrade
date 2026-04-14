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

| Item            | Value/Info                                                                                                                                                                                           |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User            | sa                                                                                                                                                                                                   |
| User's password | yourStrong(!)Password                                                                                                                                                                                |
| Database        | TradeManagement                                                                                                                                                                                      |
| Tables          | Accounts — 105 rows (5 INTERNAL + 100 PRESET)                                                                                                                                                        |
|                 | Balance — 105 rows, generated dynamically from Accounts (INTERNAL: 0, PRESET: 10000)                                                                                                                 |
|                 | BalanceHistory — starts empty, populated at runtime by broker-service                                                                                                                                |
|                 | Instruments — 15 rows                                                                                                                                                                                |
|                 | OwnedInstruments — 1575 rows (105 accounts × 15 instruments), generated via CROSS JOIN; INTERNAL accounts start at quantity 0, PRESET accounts get a quantity of (AccountId + InstrumentId) % 10 + 1 |
|                 | Packages and Products — 3 rows each                                                                                                                                                                  |
|                 | Pricing — 15 seed rows (one per instrument) inserted at init so the app is usable immediately; replaced by ~21600 rows once ContentCreator starts                                                    |
|                 | Trades — starts empty, populated at runtime by broker-service                                                                                                                                        |

## Debugging

Debug scripts are baked into the image at `~/debug/` and can be run directly inside the container — no external tools needed. This works in both Docker and Kubernetes (`kubectl exec`).

```bash
# show row counts for all tables, all accounts with balances,
# and the latest price per instrument
~/debug/check-db.sh

# show details and owned instruments for a specific account
~/debug/show-account.sh <account-id>
```

The `SA_PASSWORD` environment variable is used by the scripts and defaults to `yourStrong(!)Password`.
