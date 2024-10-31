# easyTradePricingService

A go service that provides information about instrument prices. Pricing is connected to the mssql database containing instrument prices.

## Technologies used

- Go 1.23
- Docker
- MSSql

## Endpoints or logic

### Swagger

---

Swagger endpoint is available at:

```bash
# when deployed with k8s
http://SOMEWHERE/pricing-service/swagger/index.html
```

### Endpoints

---

#### `GET` **/v1/prices/last** `(Returns the newest price record)`

##### Example cURL

```bash
curl -X GET "http://{IP_ADDRESS}:8083/v1/prices/last" -H  "accept: text/plain"
```

---

#### `GET` **/v1/prices/latest** `(Get latest price of each instrument)`

##### Example cURL

```bash
curl -X GET "http://{IP_ADDRESS}:8083/v1/prices/latest" -H  "accept: text/plain"
```

---

#### `GET` **/v1/prices/instrument/{instrumentId}?{records}** `(Get pricing data for a given instrument)`

##### Parameters

| name           | type         | data type | description                                 |
| -------------- | ------------ | --------- | ------------------------------------------- |
| `instrumentId` | required     | int       | Instrument id                               |
| `records`      | not required | int       | How many records to return. Defaults to 100 |

##### Example cURL

```bash
curl -X GET "http://{IP_ADDRESS}:8083/v1/prices/instrument/1?records=5" -H  "accept: text/plain"
```
