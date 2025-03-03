# EasyTradeBrokerService

This service is used to manage accounts' balances and process trades.

## Technologies used

- .NET 8 (ASP.NET Core)
- Docker

## Endpoints or logic

### Swagger

---

Swagger endpoint is available at:

```bash
# when deployed with k8s
http://SOMEWHERE/broker-service/swagger
```

### Problem pattern

---

The problem patterns are toggled through [feature flag service](./feature-flag-service.md). The responses from the service are cached for **FEATURE_FLAG_CACHE_DURATION_S** or default value if env var not set.

#### Db not responding

When enabled, no new records will be added to Trade table, as they will fail. Problem pattern can be enabled using the api provided with the feature flag service.

#### High CPU usage

When enabled every request will be delayed by **HIGH_CPU_USAGE_REQUEST_DELAY_MS** or default value if env var not set. During this time Collatz conjecture will be calculated for random numbers on to add a significant load to cpu. It will be run on **HIGH_CPU_USAGE_CONCURRENCY** tasks.

### Balance

---

#### `POST` **/v1/balance/{accountId}/deposit** `Deposit money to the account`

##### Parameters

| name         | type     | data type | description | source    |
| ------------ | -------- | --------- | ----------- | --------- |
| `accountId`  | required | int       | Account ID  | Path      |
| `amount`     | required | decimal   | Amount      | Body JSON |
| `name`       | required | string    | Name        | Body JSON |
| `address`    | required | string    | Address     | Body JSON |
| `email`      | required | string    | Email       | Body JSON |
| `cardNumber` | required | string    | Card number | Body JSON |
| `cardType`   | required | string    | Card type   | Body JSON |
| `cvv`        | required | string    | CVV         | Body JSON |

##### Responses

| http code | content-type       | response                                                        |
| --------- | ------------------ | --------------------------------------------------------------- |
| `200`     | `application/json` | `{"accountId": 1, "value": 23.6}`                               |
| `400`     | `application/json` | `{"code":"400","message":"Amount can't be lower that 0"}`       |
| `404`     | `application/json` | `{"code":"404","message":"Account with id {id} doesn't exist"}` |

##### Example of request JSON body

```json
{
  "amount": 100,
  "name": "Name",
  "address": "Address",
  "email": "Email",
  "cardNumber": "Card Number",
  "cardType": "Card Type",
  "cvv": "123"
}
```

##### Example cURL

```bash
curl -X 'POST' \
'http://localhost/broker-service/v1/balance/1/deposit' \
-H 'accept: text/plain' \
-H 'Content-Type: application/json' \
-d '{
    "amount": 100,
    "name": "Name",
    "address": "Address",
    "email": "Email",
    "cardNumber": "Card Number",
    "cardType": "Card Type",
    "cvv": "123"
}'
```

---

#### `POST` **/v1/balance/{accountId}/withdraw** `Withdraw money to the account`

##### Parameters

| name         | type     | data type | description | source    |
| ------------ | -------- | --------- | ----------- | --------- |
| `accountId`  | required | int       | Account ID  | Path      |
| `amount`     | required | decimal   | Amount      | Body JSON |
| `name`       | required | string    | Name        | Body JSON |
| `address`    | required | string    | Address     | Body JSON |
| `email`      | required | string    | Email       | Body JSON |
| `cardNumber` | required | string    | Card number | Body JSON |
| `cardType`   | required | string    | Card type   | Body JSON |

##### Responses

| http code | content-type       | response                                                        |
| --------- | ------------------ | --------------------------------------------------------------- |
| `200`     | `application/json` | `{"accountId": 1, "value": 23.6}`                               |
| `400`     | `application/json` | `{"code":"400","message":"Amount can't be lower that 0"}`       |
| `404`     | `application/json` | `{"code":"404","message":"Account with id {id} doesn't exist"}` |

##### Example of request JSON body

```json
{
  "amount": 10,
  "name": "Name",
  "address": "Address",
  "email": "Email",
  "cardNumber": "Card Number",
  "cardType": "Card Type"
}
```

##### Example cURL

```bash
curl -X 'POST' \
'http://localhost/broker-service/v1/balance/1/withdraw' \
-H 'accept: text/plain' \
-H 'Content-Type: application/json' \
-d '{
  "amount": 10,
  "name": "Name",
  "address": "Address",
  "email": "Email",
  "cardNumber": "Card Number",
  "cardType": "Card Type"
}'
```

---

#### `GET` **/v1/balance/{accountId}** `Get current balance of an account`

##### Parameters

| name        | type     | data type | description | source |
| ----------- | -------- | --------- | ----------- | ------ |
| `accountId` | required | int       | Account ID  | Path   |

##### Responses

| http code | content-type       | response                                                        |
| --------- | ------------------ | --------------------------------------------------------------- |
| `200`     | `application/json` | `{"accountId": 1, "value": 23.6}`                               |
| `404`     | `application/json` | `{"code":"404","message":"Account with id {id} doesn't exist"}` |

##### Example cURL

```bash
curl -X 'GET' \
'http://localhost/broker-service/v1/balance/1' \
-H 'accept: text/plain'
```

### Instrument

---

#### `GET` **/v1/instrument** `Get list of all available instruments`

##### Parameters

| name        | type     | data type | description | source |
| ----------- | -------- | --------- | ----------- | ------ |
| `accountId` | optional | int       | Account ID  | Query  |

##### Responses

| http code | content-type       | response  |
| --------- | ------------------ | --------- |
| `200`     | `application/json` | JSON body |

##### Example of response JSON body

```json
{
  "results": [
    {
      "id": 1,
      "code": "ETRAVE",
      "name": "EasyTravel",
      "description": "EasyTravel Incorporated",
      "productId": 1,
      "productName": "Share",
      "price": {
        "timestamp": "2023-07-24T13:44:22+00:00",
        "open": 139.34791667,
        "close": 139.38958333,
        "low": 137.94991929,
        "high": 140.74087808
      },
      "amount": 344
    },
    {
      "id": 2,
      "code": "EPLANE",
      "name": "EasyPlanes",
      "description": "EasyPlanes Worldwide",
      "productId": 2,
      "productName": "ETF",
      "price": {
        "timestamp": "2023-07-24T13:44:22+00:00",
        "open": 96.63777778,
        "close": 96.68222222,
        "low": 96.06399455,
        "high": 97.23283949
      },
      "amount": 966
    }
  ]
}
```

##### Example cURL

```bash
curl -X 'GET' \
'http://localhost/broker-service/v1/instrument?accountId=6' \
-H 'accept: text/plain'
```

### Trades

---

#### `POST` **/v1/trade/buy** `Quick buy`

Parameters

| name           | type     | data type | description   | source    |
| -------------- | -------- | --------- | ------------- | --------- |
| `accountId`    | required | int       | Account ID    | Body JSON |
| `instrumentId` | required | int       | Instrument ID | Body JSON |
| `amount`       | required | decimal   | Amount        | Body JSON |

Responses

| http code | content-type       | response                                                                   |
| --------- | ------------------ | -------------------------------------------------------------------------- |
| `200`     | -                  | JSON Body                                                                  |
| `400`     | `application/json` | `{"code":"400","message":"Amount can't be lower that 0"}`                  |
| `404`     | `application/json` | `{"code":"404","message":"Account/Instrument with id {id} doesn't exist"}` |

##### Example of request JSON body

```json
{
  "accountId": 6,
  "instrumentId": 1,
  "amount": 12.5
}
```

##### Example of response JSON body

```json
{
  "instrumentId": 1,
  "direction": "buy",
  "quantity": 12.5,
  "entryPrice": 140.22291667,
  "timestampOpen": "2023-08-30T14:05:37.6132984+00:00",
  "timestampClose": "2023-08-30T14:05:37.6132999+00:00",
  "tradeClosed": true,
  "transactionHappened": true,
  "status": "Instant Buy done."
}
```

##### Example cURL

```bash
curl -X 'POST' \
'http://localhost/broker-service/v1/trade/buy' \
-H 'accept: */*' \
-H 'Content-Type: application/json' \
-d '{
  "accountId": 6,
  "instrumentId": 1,
  "amount": 12.5
}'
```

---

#### `POST` **/v1/trade/sell** `Quick sell`

Parameters

| name           | type     | data type | description   | source    |
| -------------- | -------- | --------- | ------------- | --------- |
| `accountId`    | required | int       | Account ID    | Body JSON |
| `instrumentId` | required | int       | Instrument ID | Body JSON |
| `amount`       | required | decimal   | Amount        | Body JSON |

Responses

| http code | content-type       | response                                                                   |
| --------- | ------------------ | -------------------------------------------------------------------------- |
| `200`     | -                  | JSON Body                                                                  |
| `400`     | `application/json` | `{"code":"400","message":"Amount can't be lower that 0"}`                  |
| `404`     | `application/json` | `{"code":"404","message":"Account/Instrument with id {id} doesn't exist"}` |

##### Example of request JSON body

```json
{
  "accountId": 6,
  "instrumentId": 1,
  "amount": 12.5
}
```

##### Example of response JSON body

```json
{
  "instrumentId": 1,
  "direction": "sell",
  "quantity": 12.5,
  "entryPrice": 140.26458333,
  "timestampOpen": "2023-08-30T14:06:23.5028116+00:00",
  "timestampClose": "2023-08-30T14:06:23.5028126+00:00",
  "tradeClosed": true,
  "transactionHappened": true,
  "status": "Instant Sell done."
}
```

##### Example cURL

```bash
curl -X 'POST' \
'http://localhost/broker-service/v1/trade/sell' \
-H 'accept: */*' \
-H 'Content-Type: application/json' \
-d '{
  "accountId": 6,
  "instrumentId": 1,
  "amount": 12.5
}'
```

---

#### `POST` **/v1/trade/long/buy** `Long buy`

Parameters

| name           | type     | data type | description       | source    |
| -------------- | -------- | --------- | ----------------- | --------- |
| `accountId`    | required | int       | Account ID        | Body JSON |
| `instrumentId` | required | int       | Instrument ID     | Body JSON |
| `amount`       | required | decimal   | Amount            | Body JSON |
| `duration`     | required | int       | Duration in hours | Body JSON |
| `price`        | required | decimal   | Price             | Body JSON |

Responses

| http code | content-type       | response                                                                   |
| --------- | ------------------ | -------------------------------------------------------------------------- |
| `200`     | -                  | JSON Body                                                                  |
| `400`     | `application/json` | `{"code":"400","message":"Amount/Duration/Price can't be lower that 0"}`   |
| `404`     | `application/json` | `{"code":"404","message":"Account/Instrument with id {id} doesn't exist"}` |

##### Example of request JSON body

```json
{
  "accountId": 6,
  "instrumentId": 1,
  "amount": 5.5,
  "duration": 24,
  "price": 125.5
}
```

##### Example of response JSON body

```json
{
  "instrumentId": 1,
  "direction": "longbuy",
  "quantity": 5.5,
  "entryPrice": 125/5,
  "timestampOpen": "2023-08-30T14:09:25.5985529+00:00",
  "timestampClose": "2023-08-31T14:09:25.5985546+00:00",
  "tradeClosed": false,
  "transactionHappened": false,
  "status": "LongBuy registered."
}
```

##### Example cURL

```bash
curl -X 'POST' \
'http://localhost/broker-service/v1/trade/long/buy' \
-H 'accept: */*' \
-H 'Content-Type: application/json' \
-d '{
  "accountId": 6,
  "instrumentId": 1,
  "amount": 5.5,
  "duration": 24,
  "price": 125.5
}'
```

---

#### `POST` **/v1/trade/long/sell** `Long sell`

Parameters

| name           | type     | data type | description       | source    |
| -------------- | -------- | --------- | ----------------- | --------- |
| `accountId`    | required | int       | Account ID        | Body JSON |
| `instrumentId` | required | int       | Instrument ID     | Body JSON |
| `amount`       | required | decimal   | Amount            | Body JSON |
| `duration`     | required | int       | Duration in hours | Body JSON |
| `price`        | required | decimal   | Price             | Body JSON |

Responses

| http code | content-type       | response                                                                   |
| --------- | ------------------ | -------------------------------------------------------------------------- |
| `200`     | -                  | JSON Body                                                                  |
| `400`     | `application/json` | `{"code":"400","message":"Amount/Duration/Price can't be lower that 0"}`   |
| `404`     | `application/json` | `{"code":"404","message":"Account/Instrument with id {id} doesn't exist"}` |

##### Example of request JSON body

```json
{
  "accountId": 6,
  "instrumentId": 1,
  "amount": 5.5,
  "duration": 24,
  "price": 125.5
}
```

##### Example of response JSON body

```json
{
  "instrumentId": 1,
  "direction": "longsell",
  "quantity": 5.5,
  "entryPrice": 125.5,
  "timestampOpen": "2023-08-30T14:09:25.5985529+00:00",
  "timestampClose": "2023-08-31T14:09:25.5985546+00:00",
  "tradeClosed": false,
  "transactionHappened": false,
  "status": "LongSell registered."
}
```

##### Example cURL

```bash
curl -X 'POST' \
'http://localhost/broker-service/v1/trade/long/sell' \
-H 'accept: */*' \
-H 'Content-Type: application/json' \
-d '{
  "accountId": 6,
  "instrumentId": 1,
  "amount": 5.5,
  "duration": 24,
  "price": 125.5
}'
```

---

#### `POST` **/v1/trade/long/process** `Process all the long running transactions`

| http code | content-type | response       |
| --------- | ------------ | -------------- |
| `200`     | -            | Empty response |

##### Example cURL

```bash
curl -X 'POST' \
'http://localhost/broker-service/v1/trade/long/process' \
-H 'accept: */*' \
-d ''
```

---

#### `GET` **/v1/trade/{accountId}** `Get all trades for account`

##### Parameters

| name        | type     | data type | description                                     | source |
| ----------- | -------- | --------- | ----------------------------------------------- | ------ |
| `accountId` | required | int       | Account ID                                      | Path   |
| `count`     | optional | int       | Number of last trades (default value = 10)      | Query  |
| `page`      | optional | int       | Page (default value = 0)                        | Query  |
| `onlyOpen`  | optional | int       | Filter only open trades (default value = false) | Query  |
| `onlyLong`  | optional | int       | Filter only long trades (default value = false) | Query  |

##### Responses

| http code | content-type       | response  |
| --------- | ------------------ | --------- |
| `200`     | `application/json` | JSON body |

##### Example of response JSON body

```json
{
  "results": [
    {
      "instrumentId": 1,
      "direction": "longbuy",
      "quantity": 5.5,
      "entryPrice": 125.5,
      "timestampOpen": "2023-07-24T14:00:12+00:00",
      "timestampClose": "2023-07-25T14:00:12+00:00",
      "tradeClosed": false,
      "transactionHappened": false,
      "status": "LongBuy registered."
    },
    {
      "instrumentId": 1,
      "direction": "sell",
      "quantity": 12.5,
      "entryPrice": 139.80625,
      "timestampOpen": "2023-07-24T13:56:01+00:00",
      "timestampClose": "2023-07-24T13:56:01+00:00",
      "tradeClosed": true,
      "transactionHappened": true,
      "status": "Instant Sell done."
    }
  ]
}
```

##### Example cURL

```bash
curl -X 'GET' \
'http://localhost/broker-service/v1/trade/6?count=10&page=0&onlyOpen=false&onlyLong=false' \
-H 'accept: text/plain'
```
