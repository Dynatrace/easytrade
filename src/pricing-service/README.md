# easyTradePricingService

A go service that provides information about instrument prices. Pricing is connected to the mssql database containing instrument prices.

## Technologies used

- Go 1.23
- Docker
- MSSql

## Local build instructions

```bash
docker build -t easytradepricingservice .
docker run -d -p 8083:8080 --name pricing-service -e RABBITMQ_HOST=rabbitmq:80 -e RABBITMQ_USER=userxxx -e RABBITMQ_PASSWORD=passxxx -e MSSQL_CONNECTIONSTRING=db:1433 -e RABBITMQ_QUEUE=Trade_Data_Raw easytradepricingservice
```

If you want the service to work properly, you should try setting these ENV variables:

| Name                   | Description                         | Default                                                                                                                                                           |
| ---------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MANAGER_HOSTANDPORT    | manager host and port               | manager:8080                                                                                                                                                      |
| RABBITMQ_HOST          | rabbitmq host                       | rabbitmq                                                                                                                                                          |
| RABBITMQ_USER          | rabbitmq user                       | userxxx                                                                                                                                                           |
| RABBITMQ_PASSWORD      | rabbitmq user's password            | passxxx                                                                                                                                                           |
| MSSQL_CONNECTIONSTRING | database connection string          | sqlserver://sa:yourStrong(!)Password@db:1433?database=TradeManagement&connection+encrypt=false&connection+TrustServerCertificate=false&connection+loginTimeout=30 |
| PROXY_PREFIX           | prefix identifying service in nginx | pricing-service                                                                                                                                                   |

## Endpoints or logic

### Swagger

---

Swagger endpoint is available at:

```bash
# when deployed locally
http://localhost/swagger/index.html

# when deployed with compose.dev.yaml
http://localhost:8083/swagger/index.html

# when deployed with k8s
http://SOMEWHERE/pricing-service/swagger/index.html
```

Version endpoint is available at `/version`

### Endpoints

---

#### `GET` **/v1/prices/last** `(Returns the newest price record)`

##### Parameters

> | name | type | data type | description |
> | ---- | ---- | --------- | ----------- |
>
> None

##### Example cURL

> ```bash
>  curl -X GET "http://{IP_ADDRESS}:8083/v1/prices/last" -H  "accept: text/plain"
> ```

---

#### `GET` **/v1/prices/latest** `(Get latest price of each instrument)`

##### Parameters

> | name | type | data type | description |
> | ---- | ---- | --------- | ----------- |
>
> None

##### Example cURL

> ```bash
>  curl -X GET "http://{IP_ADDRESS}:8083/v1/prices/latest" -H  "accept: text/plain"
> ```

---

#### `GET` **/v1/prices/instrument/{instrumentId}?{records}** `(Get pricing data for a given instrument)`

##### Parameters

> | name           | type         | data type | description                                 |
> | -------------- | ------------ | --------- | ------------------------------------------- |
> | `instrumentId` | required     | int       | Instrument id                               |
> | `records`      | not required | int       | How many records to return. Defaults to 100 |

##### Example cURL

> ```bash
>  curl -X GET "http://{IP_ADDRESS}:8083/v1/prices/instrument/1?records=5" -H  "accept: text/plain"
> ```

## Swagger

Generate/regenerate swag files

```
swag init
```

## Test/Run go

If you want to test, the run

```
go test ./...
```

If you want to run, use

```
go run .
```
