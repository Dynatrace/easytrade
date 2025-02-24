# easyTradeContentCreator

Java service that creates the pricing data each minute.

## Technologies used

- Java
- Docker
- SQL
- Stock exchange information - candle data

## Local build instructions

```bash
docker build -t easytradecontentcreator .
docker run -d --name contentcreator easytradecontentcreator
```

If you want the service to work properly, you should try setting these ENV variables:

| Name                   | Description                             | Default                                                                                                                                              |
| ---------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| MSSQL_CONNECTIONSTRING | the connection string to MSSQL database | jdbc:sqlserver://db:1433;database=TradeManagement;user=sa;password=yourStrong(!)Password;encrypt=false;trustServerCertificate=false;loginTimeout=30; |

## Endpoints or logic

The service has no endpoints. Its logic is:

1. Clear the database.
2. Generate data for the last 24h.
3. Generate 1 row for each instrument. If we generated second 24h of data, remove last days data. Wait 60 seconds. Repeat 3.
