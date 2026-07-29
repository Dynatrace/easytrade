# EasyTrade background-service

Single Go binary that consolidates four former EasyTrade services.

| Sub-service | Package | What it does |
|---|---|---|
| **aggregator** | [`aggregator/`](aggregator) | Simulates 5 external platforms polling `offerservice` for quotes (50/50 JSON/XML) and registering fake users. Runs 10 goroutines — one per platform per job type. |
| **contentcreator** | [`contentcreator/`](contentcreator) | Generates per-minute OHLC candle data for 15 instruments and periodically purges stale trades, balance history, and accounts via the `db-adapter` gRPC service. |
| **thirdparty** | [`thirdparty/`](thirdparty), HTTP in [`server/`](server) | Simulates credit-card manufacturing and courier delivery via two independent schedulers; exposes `/v1/manufacturer` and `/version` HTTP endpoints. |
| **operator** | [`operator/`](operator) | Kubernetes-only chaos controller that watches the `high_cpu_usage` feature flag and applies/rolls back a CPU limit on `broker-service`. Only starts when `POD_NAMESPACE` is set. |

## Environment variables

| Variable | Required | Default | Used by |
|---|---|---|---|
| `OFFER_SERVICE_ADDRESS` | no | `http://offerservice:8080` | aggregator |
| `CREDIT_CARD_ORDER_SERVICE_ADDRESS` | yes | `http://credit-card-order-service:8080` | thirdparty |
| `MANUFACTURE_DELAY` | yes | — | thirdparty (seconds before first manufacture run) |
| `MANUFACTURE_RATE` | yes | — | thirdparty (seconds between manufacture runs) |
| `MANUFACTURE_DELAY_CHANCE_PERCENT` | yes | `20` | thirdparty (% chance of extra delay per run) |
| `COURIER_DELAY` | yes | — | thirdparty (seconds before first courier run) |
| `COURIER_RATE` | yes | — | thirdparty (seconds between courier runs) |
| `DB_ADAPTER_SERVICE_ADDRESS` | yes | `db-adapter:50051` | contentcreator (gRPC `host:port`) |
| `CONTENT_CLEANUP_INTERVAL` | yes | `60` | contentcreator (minutes between stale-data cleanups) |
| `CONTENT_STALE_AFTER_HOURS` | yes | `24` | contentcreator (age in hours before trades/balances/accounts are purged) |
| `FEATURE_FLAG_SERVICE_ADDRESS` | yes | `http://feature-flag-service:8080` | thirdparty + operator |
| `POD_NAMESPACE` | — | — | operator gate — must be **absent** outside Kubernetes; set by the Downward API in-cluster |
| `SYNC_INTERVAL` | no | `5s` | operator (reconciliation loop interval; only read when `POD_NAMESPACE` is set) |
| `HIGH_CPU_USAGE_BROKER_SERVICE_NAME` | no | `broker-service` | operator |
| `HIGH_CPU_USAGE_FLAG_NAME` | no | `high_cpu_usage` | operator |
| `HIGH_CPU_USAGE_BROKER_SERVICE_CPU_LIMIT` | no | `300m` | operator |

See [`.env.example`](.env.example) for a ready-to-copy local dev file.

## Build & test

```bash
go build .
go test ./...
```
