# easyTradeFeatureFlagService

A java rest service with swagger. It allows to get and update feature flag data.

## Technologies used

- Java
- Docker

## Local build instructions

```bash
docker build -t IMAGE_NAME .
docker run -d --name SERVICE_NAME IMAGE_NAME
```

## Endpoints or logic

### Swagger

---

Swagger endpoint is available at:

```bash
# when deployed with k8s
http://{IP_ADDRESS}/feature-flag-service/swagger-ui/index.html
```

### Api v1

---

#### `GET` **/v1/flags/{flagId}** `(Get flag)`

##### Parameters

| name     | type         | data type | description      |
| -------- | ------------ | --------- | ---------------- |
| `flagId` | not required | string    | The id of a flag |

To get all flags, use the same approach but without {FLAGID} parameter.

#### Example cURL

```bash
curl -X GET "http://{IP_ADDRESS}:8094/v1/flags/db_not_responding" -H  "accept: */*"
```

---

#### `GET` **/v1/flags?tag={tag}** `(Get flags by tag)`

##### Parameters

| name  | type     | data type | description    |
| ----- | -------- | --------- | -------------- |
| `tag` | required | string    | The flags' tag |

#### Example cURL

```bash
curl -X GET "http://{IP_ADDRESS}:8094/v1/flags?tag=problem_pattern" -H  "accept: */*"
```

---

#### `PUT` **/v1/flags/{flagId}** `(Enable/disable flag)`

##### Parameters

| name      | type     | data type | description                |
| --------- | -------- | --------- | -------------------------- |
| `flagId`  | required | string    | The id of a flag           |
| `enabled` | required | boolean   | Is the flag enabled or not |

##### Example cURL

```bash
curl -X PUT "http://{IP_ADDRESS}:8094/v1/flags/{flagId}/" -H  "accept: application/json" -d "{\"enabled\": true}"
```

To disable the flag, use the same approach but with the "enabled" parameter set to false.

##### Example of JSON body

```json
{
  "enabled": true
}
```

### Feature flags

---

| Flag id | Default | Description |
| --------------------------------- | ------- | ----------- |
| `frontend_feature_flag_management` | `true` | When enabled, allows controlling problem pattern feature flags from the main app UI. |
| `db_not_responding` | `false` | When enabled, the DB not responding will be simulated, causing errors when trying to create any new transactions. |
| `ergo_aggregator_slowdown` | `false` | When enabled, the OfferService will respond with a delay to 2 out of 5 AggregatorServices, causing those services to pause queries for 1 hour. |
| `factory_crisis` | `false` | When enabled, the factory won't produce new cards, causing the Third party service not to process credit card orders. |
| `credit_card_meltdown` | `false` | When enabled, checking the latest credit card order status results in a division by zero error. |
| `high_cpu_usage` | `false` | Causes a slowdown of broker-service response time and increases CPU usage. If deployed on K8s, a CPU resource limit is also applied. |
| `credit_card_validation` | `false` | When enabled, credit card numbers are validated via the mainframe before deposit/withdraw operations in broker-service are processed. Requires `MAINFRAME_SERVICE_URL` to be configured in broker-service. Controlled by the `ENABLE_CREDIT_CARD_VALIDATION` environment variable. |
