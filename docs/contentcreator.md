# easyTradeContentCreator
Java service that creates the pricing data each minute.    

<br/><br/>

## Techs
Java   
Docker   
SQL   
Stock exchange information - candle data   

<br/><br/>

## Local build instructions
```sh
docker build -t easytradecontentcreator .
docker run -d --name contentcreator easytradecontentcreator
```   
If you want the service to work properly, you should try setting these ENV variables:
- MSSQL_CONNECTIONSTRING - the connection string to MSSQL database, for example "jdbc:sqlserver://db:1433;database=TradeManagement;user=sa;password=yourStrong(!)Password;encrypt=false;trustServerCertificate=false;loginTimeout=30;"

<br/><br/>

## Endpoints or logic
The service has no endpoints. Its logic is:
1. Clear the database.
2. Generate data for the last 24h.
3. Generate 1 row for each instrument. If we generated second 24h of data, remove last days data. Wait 60 seconds. Repeat 3.

<br/><br/>