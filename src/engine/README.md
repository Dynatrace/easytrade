# easyTradeEngine

Java service used to periodically run scheduled tasks.  
Right now it only tries to finalize long running transactions each 60 seconds.

## Technologies used

- Java
- Docker

## Local build instructions

```bash
docker build -t easytradeengine .
docker run -d --name engine easytradeengine
```

If you want the service to work properly, you should try setting these ENV variables:

| Name               | Description                         | Default             |
| ------------------ | ----------------------------------- | ------------------- |
| BROKER_HOSTANDPORT | broker service host and port        | broker-service:8080 |
| PROXY_PREFIX       | prefix identifying service in nginx | engine              |

## Endpoints or logic

### Swagger

---

Swagger endpoint is available at:

```bash
# when deployed locally
http://localhost:8080/api/swagger-ui/

# when deployed with compose.dev.yaml
http://localhost:8090/api/swagger-ui/

# when deployed with k8s
http://SOMEWHERE/engine/api/swagger-ui/
```

Version endpoint is available at `/api/version`

### Endpoints

---

#### `GET` **/api/trade/scheduler/start** `(Start long running transaction scheduler)`

##### Parameters

> | name | type | data type | description |
> | ---- | ---- | --------- | ----------- |
>
> None

##### Example cURL

> ```bash
>  curl -X GET "http://{IP_ADDRESS}:8090/api/trade/scheduler/start" -H "accept: */*"
> ```

---

#### `GET` **/api/trade/scheduler/status** `(Check scheduler status)`

##### Parameters

> | name | type | data type | description |
> | ---- | ---- | --------- | ----------- |
>
> None

##### Example cURL

> ```bash
>  curl -X GET "http://{IP_ADDRESS}:8090/api/trade/scheduler/status" -H "accept: */*"
> ```

---

#### `GET` **/api/trade/scheduler/stop** `(Stop long running transaction scheduler)`

##### Parameters

> | name | type | data type | description |
> | ---- | ---- | --------- | ----------- |
>
> None

##### Example cURL

> ```bash
>  curl -X GET "http://{IP_ADDRESS}:8090/api/trade/scheduler/stop" -H "accept: */*"
> ```

---

#### `POST` **/api/trade/scheduler/notification** `(Trade closed notification)`

##### Parameters

> | name                  | type     | data type      | description     | source    |
> | --------------------- | -------- | -------------- | --------------- | --------- |
> | `accountId`           | required | int            | Account ID      | Body JSON |
> | `direction`           | required | String         | Trade direction | Body JSON |
> | `entryPrice`          | required | double         | Entry price     | Body JSON |
> | `id`                  | required | int            | Trade ID        | Body JSON |
> | `instrumentId`        | required | int            | Instrument ID   | Body JSON |
> | `quantity`            | required | double         | Quantity        | Body JSON |
> | `status`              | required | String         | Trade status    | Body JSON |
> | `timestampClose`      | required | OffsetDateTime | Close timestamp | Body JSON |
> | `timestampOpen`       | required | OffsetDateTime | Open timestamp  | Body JSON |
> | `tradeClosed`         | required | boolean        | Trade closed    | Body JSON |
> | `transactionHappened` | required | boolean        | Trade happened  | Body JSON |

##### Example of request JSON body

> ```json
> {
>   "accountId": 6,
>   "direction": "longbuy",
>   "entryPrice": 178.98,
>   "id": 12312,
>   "instrumentId": 1,
>   "quantity": 10,
>   "status": "Long buy transaction finished!",
>   "timestampClose": "2023-08-30T11:11:55.665Z",
>   "timestampOpen": "2023-08-31T11:11:55.665Z",
>   "tradeClosed": true,
>   "transactionHappened": true
> }
> ```

##### Example cURL

> ```bash
> curl -X POST "http://{IP_ADDRESS}:8090/api/trade/scheduler/notification" -H  "accept: */*" -H  "Content-Type: application/json" -d '{  "accountId": 6,  "direction": "longbuy",  "entryPrice": 178.98,  "id": 12312,  "instrumentId": 1,  "quantity": 10,  "status": "Long buy transaction finished!",  "timestampClose": "2023-08-30T11:11:55.665Z",  "timestampOpen": "2023-08-31T11:11:55.665Z",  "tradeClosed": true,  "transactionHappened": true}'
> ```
