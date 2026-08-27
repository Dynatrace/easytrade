# easyTradeFeatureFlagService

A Go REST service that allows to get and update feature flag data.

## Technologies used

- Golang
- Docker

## Local build instructions

```bash
docker build -t IMAGE_NAME .
docker run -d --name SERVICE_NAME IMAGE_NAME
```

## Feature flags

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
