# easyTradeFeatureFlagService

A Go REST service that allows to get and update feature flag data.

Exposes `/version`, `/livez` (liveness) and `/readyz` (readiness) on port `8080`.
See [`feature-flag-service.http`](feature-flag-service.http) for the flag API requests.

## Technologies used

- Golang
- Docker

## Local build instructions

```bash
make build services=feature-flag-service      # build the image from local source
make redeploy services=feature-flag-service   # rebuild and recreate it in the running stack
```

Run `make help` for every target.

## Feature flags

---

Every flag can also be given a startup default via an environment variable. `ENABLE_MODIFY`
(default `true`) controls whether flags may be changed at all through the API.

| Flag id | Env variable | Default | Description |
| --------------------------------- | ------------ | ------- | ----------- |
| `frontend_feature_flag_management` | `ENABLE_FRONTEND_MODIFY` | `true` | When enabled, allows controlling problem pattern feature flags from the main app UI. |
| `db_not_responding` | `ENABLE_DB_NOT_RESPONDING` | `false` | When enabled, the DB not responding will be simulated, causing errors when trying to create any new transactions. |
| `ergo_aggregator_slowdown` | `ENABLE_ERGO_AGGREGATOR_SLOWDOWN` | `false` | When enabled, the Offer Service will respond with a delay to 2 out of the 5 aggregator platforms simulated by `background-service`, causing them to pause queries for 1 hour. |
| `factory_crisis` | `ENABLE_FACTORY_CRISIS` | `false` | When enabled, the factory won't produce new cards, so `background-service` stops processing credit card orders. |
| `credit_card_meltdown` | `ENABLE_CREDIT_CARD_MELTDOWN` | `false` | When enabled, checking the latest credit card order status results in a division by zero error. |
| `high_cpu_usage` | `ENABLE_HIGH_CPU_USAGE` | `false` | Causes a slowdown of broker-service response time and increases CPU usage. If deployed on K8s, a CPU resource limit is also applied. |
| `credit_card_validation` | `ENABLE_CREDIT_CARD_VALIDATION` | `false` | When enabled, credit card numbers are validated via the mainframe before deposit/withdraw operations in broker-service are processed. Requires `MAINFRAME_SERVICE_ADDRESS` to be configured in broker-service. |
