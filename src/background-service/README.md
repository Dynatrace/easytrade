# EasyTrade background-service

Single Go binary that consolidates four former EasyTrade services.

| Sub-service | Package | What it does |
|---|---|---|
| **aggregator** | [`aggregator/`](aggregator) | Simulates 5 external platforms polling `offer-service` for quotes (50/50 JSON/XML) and registering fake users. Runs 10 goroutines — one per platform per job type. |
| **contentcreator** | [`contentcreator/`](contentcreator) | Generates per-minute OHLC candle data for 15 instruments and periodically purges stale trades, balance history, and accounts via the `db-adapter` gRPC service. |
| **thirdparty** | [`thirdparty/`](thirdparty)| Simulates credit-card manufacturing and courier delivery via a single runner; exposes `/v1/manufacturer` and `/version` HTTP endpoints. |
| **operator** | [`operator/`](operator) | Kubernetes-only chaos controller that watches the `high_cpu_usage` feature flag and applies/rolls back a CPU limit on `broker-service`. Only starts when `POD_NAMESPACE` is set. |

## Environment variables

| Variable | Required | Default | Used by |
|---|---|---|---|
| `OFFER_SERVICE_ADDRESS` | yes | — | aggregator |
| `CREDIT_CARD_ORDER_SERVICE_ADDRESS` | yes | — | thirdparty |
| `THIRD_PARTY_DELAY` | no | `10` | thirdparty (seconds before first run) |
| `THIRD_PARTY_RATE` | no | `10` | thirdparty (seconds between runs) |
| `DELAY_CHANCE_PERCENT` | no | `20` | thirdparty (% chance of extra delay per manufacture run) |
| `DB_ADAPTER_ADDRESS` | yes | — | contentcreator (gRPC `host:port`) |
| `FEATURE_FLAG_SERVICE_ADDRESS` | yes | — | thirdparty + operator |
| `POD_NAMESPACE` | — | — | operator gate — must be **absent** outside Kubernetes; set by the Downward API in-cluster |
| `SYNC_INTERVAL` | no | `5s` | operator (reconciliation loop interval; only read when `POD_NAMESPACE` is set) |
| `HIGH_CPU_USAGE_BROKER_SERVICE_CPU_LIMIT` | no | `300m` | operator |

Required variables have no fallback — the process exits if they are unset. The values
listed in `compose.yaml` are the conventional in-cluster addresses, not code defaults.

The target deployment name (`broker-service`) and the flag it watches (`high_cpu_usage`)
are compile-time constants in [`operator/config.go`](operator/config.go), not environment
variables.

See [`.env.example`](.env.example) for a ready-to-copy local dev file.

## Build & test

```bash
go build .
go test ./...
```
