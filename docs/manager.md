# easyTradeManager
This service performes the role of a data access layer to database. Almost all calls to database go through it.   

<br/><br/>

## Techs
.Net Core 5.0   
Docker   

<br/><br/>

## Local build instructions
```sh
docker build -t easytrademanager .
docker run -d --name manager easytrademanager
```   
If you want the service to work properly, you should try setting these ENV variables:
- MSSQL_CONNECTIONSTRING -database connection string, for example "Data Source=db;Initial Catalog=TradeManagement;Persist Security Info=True;User ID=sa;Password=yourStrong(!)Password"

<br/><br/>

## Endpoints or logic
Swagger endpoint is available at:
```sh
//when deployed locally
http://localhost/swagger

//when deployed with docker-compose
http://localhost:8081/swagger

//when deployed with k8s
Not available
```    

<br/><br/>

Manager has support for one problem pattern - DbNotRespondingPlugin. When this problem pattern is enabled, no new records will be added to Trade table, as they will fail.   
Problem pattern can be enabled manually with an endpoint, or via the PluginService

<br/><br/>

`GET` <b>/api/Accounts/GetAccountById/{id}</b> `(Get account by id)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `id` | required | int | Account id |

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8081/api/Accounts/GetAccountById/1" -H  "accept: text/plain"
> ```

<br/><br/>

`PUT` <b>/api/Accounts/ModifyAccount</b> `(Update account info)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `id` | required | int | Account id |
> | `packageId` | required | int | Package id |
> | `firstName` | required | string | First name |
> | `lastName` | required | string | Last name |
> | `username` | required | string | Username |
> | `email` | required | string | Email |
> | `hashedPassword` | required | string | Password hash |
> | `availableBalance` | required | decimal | Current account balance |
> | `origin` | required | DATA_TYPE | How was the account created |
> | `creationDate` | required | dateTime | When was the account created |
> | `packageActivationDate` | required | dateTime | When was the package activated |
> | `accountActive` | required | boolean | Is the account active? |

##### Example cURL
> ```bash
>  curl -X PUT "http://172.18.147.235:8081/api/Accounts/ModifyAccount" -H  "accept: */*" -H  "Content-Type: application/json" -d "{\"id\":7,\"packageId\":1,\"firstName\":\"Jessica\",\"lastName\":\"Smithin\",\"username\":\"jessica_smith\",\"email\":\"jessica.smith@gmail.com\",\"hashedPassword\":\"139990b95cf8e8fddcb6e3202ed92a216d656a5bbe8ebb2a28bfe9911e6c3c51\",\"availableBalance\":425542.73326551,\"origin\":\"PRESET\",\"creationDate\":\"2021-08-11T13:00:00\",\"packageActivationDate\":\"2021-08-11T13:00:00\",\"accountActive\":true}"
> ```

##### Example of JSON body
> ```json
>{
>  "id": 7,
>  "packageId": 1,
>  "firstName": "Jessica",
>  "lastName": "Smithin",
>  "username": "jessica_smith",
>  "email": "jessica.smith@gmail.com",
>  "hashedPassword": "139990b95cf8e8fddcb6e3202ed92a216d656a5bbe8ebb2a28bfe9911e6c3c51",
>  "availableBalance": 425542.73326551,
>  "origin": "PRESET",
>  "creationDate": "2021-08-11T13:00:00",
>  "packageActivationDate": "2021-08-11T13:00:00",
>  "accountActive": true
>}
> ```

<br/><br/>

`GET` <b>/api/Balancehistory/GetBalancehistoryById/{id}</b> `(Get balance history record by id)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `id` | required | int | Balance history id |

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8081/api/Balancehistory/GetBalancehistoryById/1" -H  "accept: text/plain"
> ```

<br/><br/>

`GET` <b>/api/Balancehistory/GetBalancehistoriesForAccount/{accountid}/{records}</b> `(Get balance history records for an account)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `accountid` | required | int | Account id |
> | `records` | not required | int | How many records to return. Defaults to 100 |

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8081/api/Balancehistory/GetBalancehistoriesForAccount/1/100" -H  "accept: text/plain"
> ```

<br/><br/>

`POST` <b>/api/Balancehistory/AddBalancehistory</b> `(Create new history balance record)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `accountId` | required | int | Account id |
> | `oldValue` | required | decimal | What was the old value |
> | `valueChange` | required | decimal | How the value changed |
> | `actionType` | required | string | What was the action type. Must be one of: 'withdraw', 'deposit', 'buy', 'sell', 'packagefee', 'transactionfee', 'collectfee', 'longbuy', 'longsell' |
> | `actionDate` | required | dateTime | When the action happened |

##### Example cURL
> ```bash
>  curl -X POST "http://172.18.147.235:8081/api/Balancehistory/AddBalancehistory" -H  "accept: text/plain" -H  "Content-Type: application/json" -d "{\"accountId\":7,\"oldValue\":1,\"valueChange\":1,\"actionType\":\"buy\",\"actionDate\":\"2022-12-22T17:42:18.395Z\"}"
> ```

##### Example of JSON body
> ```json
>{
>  "accountId": 7,
>  "oldValue": 1,
>  "valueChange": 1,
>  "actionType": "buy",
>  "actionDate": "2022-12-22T17:42:18.395Z"
>}
> ```

<br/><br/>

`GET` <b>/api/Instruments/GetInstruments</b> `(Get instruments list)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> None

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8081/api/Instruments/GetInstruments" -H  "accept: text/plain"
> ```

<br/><br/>

`GET` <b>/api/Instruments/GetInstrumentById/{id}</b> `(Get instrument with given id)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `id` | required | int | Instrument id |

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8081/api/Instruments/GetInstrumentById/1" -H  "accept: text/plain"
> ```

<br/><br/>

`GET` <b>/api/Ownedinstruments/GetOwnedinstrumentsById/{id}</b> `(Get owned instrument record by id)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `id` | required | int | Owned instruments id |

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8081/api/Ownedinstruments/GetOwnedinstrumentsById/1" -H  "accept: text/plain"
> ```

<br/><br/>

`GET/PUT/POST/DELETE` <b>/api/Ownedinstruments/GetOwnedinstrumentsForAccount/{accountid}</b> `(Get owned instruments by account id)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `accountid` | required | int | Account id |

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8081/api/Ownedinstruments/GetOwnedinstrumentsForAccount/1" -H  "accept: text/plain"
> ```

<br/><br/>

`GET` <b>/api/Ownedinstruments/GetOwnedinstrumentsByAccountIdAndInstrumentId/{accountId}/{instrumentId}</b> `(Get owned instruments by account id and instrument id)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `accountId` | required | int | Account id |
> | `instrumentId` | required | int | Instrument id |

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8081/api/Ownedinstruments/GetOwnedinstrumentsByAccountIdAndInstrumentId/1/1" -H  "accept: text/plain"
> ```

<br/><br/>

`POST` <b>/api/Ownedinstruments/AddOwnedinstruments</b> `(Create owned instruments record)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `accountId` | required | int | Account id |
> | `instrumentId` | required | int | Instrument id |
> | `quantity` | required | decimal | Quantity |
> | `lastModificationDate` | required | dateTime | Last modification date |

##### Example cURL
> ```bash
>  curl -X POST "http://172.18.147.235:8081/api/Ownedinstruments/AddOwnedinstruments" -H  "accept: text/plain" -H  "Content-Type: application/json" -d "{\"accountId\":1,\"instrumentId\":15,\"quantity\":1,\"lastModificationDate\":\"2022-12-22T17:53:44.168Z\"}"
> ```

##### Example of JSON body
> ```json
>{
>  "accountId": 1,
>  "instrumentId": 15,
>  "quantity": 1,
>  "lastModificationDate": "2022-12-22T17:53:44.168Z"
>}
> ```

<br/><br/>

`DELETE` <b>/api/Ownedinstruments/DeleteOwnedinstrumentsById/{id}</b> `(Delete owned instruments by id)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `id` | required | int | Owned instruments id |

##### Example cURL
> ```bash
>  curl -X DELETE "http://172.18.147.235:8081/api/Ownedinstruments/DeleteOwnedinstrumentsById/1578" -H  "accept: */*"
> ```

<br/><br/>

`PUT` <b>/api/Ownedinstruments/ModifyOwnedinstruments</b> `(Update owned instruments)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `id` | required | int | Owned instruments id |
> | `accountId` | required | int | Account id |
> | `instrumentId` | required | int | Instrument id |
> | `quantity` | required | decimal | Quantity |
> | `lastModificationDate` | required | dateTime | Last modification date |

##### Example cURL
> ```bash
>  curl -X PUT "http://172.18.147.235:8081/api/Ownedinstruments/ModifyOwnedinstruments" -H  "accept: */*" -H  "Content-Type: application/json" -d "{\"id\":1577,\"accountId\":1,\"instrumentId\":15,\"quantity\":2,\"lastModificationDate\":\"2022-12-22T17:53:44.168Z\"}"
> ```

##### Example of JSON body
> ```json
>{
>  "id": 1577,    
>  "accountId": 1,
>  "instrumentId": 15,
>  "quantity": 2,
>  "lastModificationDate": "2022-12-22T17:53:44.168Z"
>}
> ```

<br/><br/>

`GET` <b>/api/Packages/GetPackageById/{id}</b> `(Get package record by id)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `id` | required | int | Package id |

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8081/api/Packages/GetPackageById/1" -H  "accept: text/plain"
> ```

<br/><br/>

`GET` <b>/api/Packages/GetPackages</b> `(Get package list)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> None

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8081/api/Packages/GetPackages" -H  "accept: text/plain"
> ```

<br/><br/>

`GET` <b>/api/plugins</b> `(Get all plugins status)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> None

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8081/api/plugins" -H  "accept: text/plain"
> ```

<br/><br/>

`GET` <b>/api/plugins/{pluginName}</b> `(Get plugin by name)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `pluginName` | required | string | Plugin name |

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8081/api/plugins/DbNotRespondingPlugin" -H  "accept: text/plain"
> ```

<br/><br/>

`PUT` <b>/api/plugins/{pluginName}</b> `(Change value of enabled for a plugin with given name)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `pluginName` | required | string | Plugin name |
> | `enabled` | required | boolean | Is the plugin enabled? |

##### Example cURL
> ```bash
>  curl -X PUT "http://172.18.147.235:8081/api/plugins/DbNotRespondingPlugin" -H  "accept: */*" -H  "Content-Type: application/json" -d "{\"enabled\":false}"
> ```

##### Example of JSON body
> ```json
>{
>  "enabled": false
>}
> ```

<br/><br/>

`GET` <b>/api/Pricing/GetLastPrice</b> `(Get last price from database)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> None

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8081/api/Pricing/GetLastPrice" -H  "accept: text/plain"
> ```

<br/><br/>

`GET` <b>/api/Pricing/GetLastPriceForInstrument/{instrument}</b> `(Get last price for an instrument)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `instrument` | required | DATA_TYPE | DESCRIPTION |

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8081/api/Pricing/GetLastPriceForInstrument/1" -H  "accept: text/plain"
> ```

<br/><br/>

`GET` <b>/api/Pricing/GetLatestPrices</b> `(Get latest price list)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> None

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8081/api/Pricing/GetLatestPrices" -H  "accept: text/plain"
> ```

<br/><br/>

`GET` <b>/api/Pricing/GetPricingDataForInstrument/{instrument}/{records}</b> `(Get pricing data for an instrument)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `instrument` | required | int | Instrument id |
> | `records` | not required | int | How many records to return. Defaults to 100 |

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8081/api/Pricing/GetPricingDataForInstrument/1/1" -H  "accept: text/plain"
> ```

<br/><br/>

`GET` <b>/api/Products/GetProductById/{id}</b> `(Get product record by id)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `id` | required | int | Product id |

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8081/api/Products/GetProductById/1" -H  "accept: text/plain"
> ```

<br/><br/>

`GET` <b>/api/Products/GetProducts</b> `(Get product list)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> None

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8081/api/Products/GetProducts" -H  "accept: text/plain"
> ```

<br/><br/>

`GET` <b>/api/Trades/GetTrade/{id}</b> `(Get trade record by id)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `id` | required | int | Trade id |

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8081/api/Trades/GetTrade/1" -H  "accept: text/plain"
> ```

<br/><br/>

`GET` <b>/api/Trades/GetAllTrades/{records}</b> `(Get all trade records)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `records` | not required | int | How many records to return. Defaults to 100 |

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8081/api/Trades/GetAllTrades/100" -H  "accept: text/plain"
> ```

<br/><br/>

`GET` <b>/api/Trades/GetAllTradesForAccount/{account}/{records}</b> `(Get all trade records for account)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `account` | required | int | Account id |
> | `records` | not required | int | How many records to return. Defaults to 100 |

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8081/api/Trades/GetAllTradesForAccount/1/100" -H  "accept: text/plain"
> ```

<br/><br/>

`GET` <b>/api/Trades/GetLongRunningTransactionsForAccount/{account}/{records}</b> `(Get long running transaction trade records for account)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `account` | required | int | Account id |
> | `records` | not required | int | How many records to return. Defaults to 100 |

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8081/api/Trades/GetLongRunningTransactionsForAccount/1/100" -H  "accept: text/plain"
> ```

<br/><br/>

`GET` <b>/api/Trades/GetOpenTradesForAccount/{account}</b> `(Get open trade records for account)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `account` | required | int | Account id |

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8081/api/Trades/GetOpenTradesForAccount/1" -H  "accept: text/plain"
> ```

<br/><br/>

`GET` <b>/api/Trades/GetOpenTrades</b> `(Get open trade records)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> None

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8081/api/Trades/GetOpenTrades" -H  "accept: text/plain"
> ```

<br/><br/>

`GET` <b>/api/Trades/GetAllTradesForInstrument/{instrument}/{records}</b> `(Get all trade for instrument)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `instrument` | required | int | Instrument id |
> | `records` | not required | int | How many records to return. Defaults to 100 |

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8081/api/Trades/GetAllTradesForInstrument/1/100" -H  "accept: text/plain"
> ```

<br/><br/>

`PUT` <b>/api/Trades/ModifyTradeById/{id}</b> `(Update a trade record)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `id` | required | int | Trade id |
> | `accountId` | required | int | Account id |
> | `instrumentId` | required | int | Instrument id |
> | `direction` | required | string | What kind of trade is it, must be one of: 'buy', 'sell', 'longbuy', 'longsell' |
> | `quantity` | required | decimal | Quantity |
> | `entryPrice` | required | decimal | Price |
> | `timestampOpen` | required | dateTime | When was the trade started |
> | `timestampClose` | required | dateTime | When will the trade close |
> | `tradeClosed` | required | boolean | Did the trade close |
> | `transactionHappened` | required | boolean | Did a transaction happen |
> | `status` | required | string | Trades status |

##### Example cURL
> ```bash
>  curl -X PUT "http://172.18.147.235:8081/api/Trades/ModifyTradeById/1" -H  "accept: */*" -H  "Content-Type: application/json" -d "{\"id\":1,\"accountId\":6,\"instrumentId\":1,\"direction\":\"buy\",\"quantity\":147,\"entryPrice\":159.625,\"timestampOpen\":\"2022-08-09T03:51:00\",\"timestampClose\":\"2022-08-09T04:51:00\",\"tradeClosed\":true,\"transactionHappened\":false,\"status\":\"Transaction did not succeed\"}"
> ```

##### Example of JSON body
> ```json
>{
>  "id": 1,
>  "accountId": 6,
>  "instrumentId": 1,
>  "direction": "buy",
>  "quantity": 147,
>  "entryPrice": 159.625,
>  "timestampOpen": "2022-08-09T03:51:00",
>  "timestampClose": "2022-08-09T04:51:00",
>  "tradeClosed": true,
>  "transactionHappened": false,
>  "status": "Transaction did not succeed"
>}
> ```

<br/><br/>

`POST` <b>/api/Trades/CreateTrade</b> `(Create a new trade record)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `accountId` | required | int | Account id |
> | `instrumentId` | required | int | Instrument id |
> | `direction` | required | string | What kind of trade is it, must be one of: 'buy', 'sell', 'longbuy', 'longsell' |
> | `quantity` | required | decimal | Quantity |
> | `entryPrice` | required | decimal | Price |
> | `timestampOpen` | required | dateTime | When was the trade started |
> | `timestampClose` | required | dateTime | When will the trade close |
> | `tradeClosed` | required | boolean | Did the trade close |
> | `transactionHappened` | required | boolean | Did a transaction happen |
> | `status` | required | string | Trades status |

##### Example cURL
> ```bash
>  curl -X POST "http://172.18.147.235:8081/api/Trades/CreateTrade" -H  "accept: text/plain" -H  "Content-Type: application/json" -d "{\"accountId\":6,\"instrumentId\":1,\"direction\":\"buy\",\"quantity\":147,\"entryPrice\":159.625,\"timestampOpen\":\"2022-08-09T03:51:00\",\"timestampClose\":\"2022-08-09T04:51:00\",\"tradeClosed\":true,\"transactionHappened\":false,\"status\":\"Transaction did not succeed\"}"
> ```

##### Example of JSON body
> ```json
>{
>  "accountId": 6,
>  "instrumentId": 1,
>  "direction": "buy",
>  "quantity": 147,
>  "entryPrice": 159.625,
>  "timestampOpen": "2022-08-09T03:51:00",
>  "timestampClose": "2022-08-09T04:51:00",
>  "tradeClosed": true,
>  "transactionHappened": false,
>  "status": "Transaction did not succeed"
>}
> ```

<br/><br/>

`POST` <b>/api/Trades/CloseOverdueTrades</b> `(Close trades that are overdue)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> None

##### Example cURL
> ```bash
>  curl -X POST "http://172.18.147.235:8081/api/Trades/CloseOverdueTrades" -H  "accept: */*" -d ""
> ```

<br/><br/>


