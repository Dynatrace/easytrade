# easyTradePricingService

A go service that provides information about instrument prices. Pricing data is fetched from the `db-adapter` service over gRPC.

## Technologies used

- Go 1.26
- Docker
- gRPC (db-adapter)

## Local build instructions

```bash
docker build -t IMAGE_NAME .
docker run -d --name SERVICE_NAME IMAGE_NAME
```

### Run locally without Docker

```bash
make proto   # regenerate gRPC stubs from src/proto/ → proto/*.pb.go (requires protoc + protoc-gen-go + protoc-gen-go-grpc)
make run     # go run .
```

`make proto` invokes `generate-proto.sh`, which reads `../proto/pricing_service.proto` and `../proto/common.proto` and writes generated Go files into `proto/`; re-run it whenever the shared proto files change.

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
