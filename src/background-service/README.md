# EasyTrade background-service

Single Go binary that consolidates four former EasyTrade services.

| Sub-service | Package | What it does |
|---|---|---|
| **aggregator** | [`aggregator/`](aggregator) | Simulates 5 external platforms polling `offerservice` for quotes (50/50 JSON/XML) and registering fake users. Runs 10 goroutines — one per platform per job type. |
| **contentcreator** | [`contentcreator/`](contentcreator) | Generates per-minute OHLC candle data for 15 instruments and periodically purges stale trades, balance history, and accounts via the `db-adapter` gRPC service. |
| **thirdparty** | [`thirdparty/`](thirdparty)| Simulates credit-card manufacturing and courier delivery via a single runner; exposes `/v1/manufacturer` and `/version` HTTP endpoints. |
| **operator** | [`operator/`](operator) | Kubernetes-only chaos controller that watches the `high_cpu_usage` feature flag and applies/rolls back a CPU limit on `broker-service`. Only starts when `POD_NAMESPACE` is set. |

## Environment variables

| Variable | Required | Default | Used by |
|---|---|---|---|
| `OFFER_SERVICE_ADDRESS` | no | `http://offerservice:8080` | aggregator |
| `CREDIT_CARD_ORDER_SERVICE_ADDRESS` | yes | `http://credit-card-order-service:8080` | thirdparty |
| `THIRD_PARTY_DELAY` | yes | — | thirdparty (seconds before first run) |
| `THIRD_PARTY_RATE` | yes | — | thirdparty (seconds between runs) |
| `DELAY_CHANCE_PERCENT` | yes | `20` | thirdparty (% chance of extra delay per manufacture run) |
| `DB_ADAPTER_ADDRESS` | yes | `db-adapter:50051` | contentcreator (gRPC `host:port`) |
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
