# easyTradeDb
MSSQL database service   

<br/><br/>

## Techs
MSSQL   
Docker    
Bash scripts   
JSON   

<br/><br/>

## Local build instructions
```sh
//by default db will start on port 1433

docker build -t easytradedb .
docker run -d --name db easytradedb

//running with default password passed in ENV
docker run -d --env SA_PASSWORD=yourStrong(!)Password --name db easytradedb
```   
If you want the service to work properly, you should try setting these ENV variables:
- SA_PASSWORD - the database password, by default we use "yourStrong(!)Password". 


<br/><br/>

## Endpoints or logic
The MSSQL is initialized with:
- User: sa, password given in ENV
- Database: TradeManagement
- Tables: 
  - Accounts -> around 100 rows, 
  - BalanceHistory -> around 13000 rows,
  - Instruments -> 15 rows,
  - OwnedInstruments -> around 1500 rows,
  - Packages and Products -> 3 rows each,
  - Trades -> some initial trade data, around 13000 rows,
  - Pricing -> starts up empty, but gets filled with around 21000 rows by ContenCreator service after it starts

<br/><br/>