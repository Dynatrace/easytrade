# EasyTrade background-service

`background-service` is a single Go binary that consolidates four EasyTrade
services that previously ran as separate processes:

| Original service | Language | What it did | Now lives in |
|---|---|---|---|
| `aggregator-service` | Go | Simulated 5 external "aggregator platforms" polling `offerservice` for quotes (50/50 JSON/XML) and signing up fake users | [`aggregator/`](aggregator) |
| `contentcreator` | Java (plain JDBC, no Spring) | Generates per-minute OHLC candle pricing data for 15 instruments, now via the `db-adapter` gRPC service instead of direct MSSQL access (see [`db-adapter/`](db-adapter)) | [`contentcreator/`](contentcreator) |
| `problem-operator` | Go (`k8s.io/client-go`) | Kubernetes-only controller watching feature flags and applying/rolling back chaos patterns (currently: a CPU limit on `broker-service`) | [`operator/`](operator) |
| `third-party-service` | Java/Spring Boot | Simulated credit-card manufacturing and courier delivery via two in-memory schedulers, exposed at `/v1/manufacturer` and `/version` | [`thirdparty/`](thirdparty), HTTP surface in [`server/`](server) |

Nothing user-visible changed: the same 5 aggregator platforms hit
`offerservice` the same way, the same 15 instruments get a new candle every
minute, the same `/third-party-service/version` and
`/third-party-service/v1/manufacturer` routes work through nginx, and the
same `high_cpu_usage`/`factory_crisis` feature flags drive the same problem
patterns. What changed is that duplicated logic across the four originals —
loggers, interval/ticker runners, outbound JSON HTTP clients, and two
near-identical feature-flag clients — now has exactly one implementation
each, shared by every consumer.

## Package layout

```
background-service/
  main.go            composition root: env/logger bootstrap, job registration,
                      HTTP server, graceful shutdown
  config/            unified env-var loader (required/optional-with-default)
  logger/             single zap logger singleton
  scheduler/          the one interval-runner abstraction (Job, Runner,
                      AdaptiveRunner, Group) backing every recurring job
  httpclient/         shared outbound JSON GET/POST helper
  featureflag/        single feature-flag-service client
  server/             inbound HTTP (gin): /version, /v1/manufacturer
  aggregator/         ported aggregator-service (platforms, offer/signup
                      clients, config.yaml)
  contentcreator/     ported contentcreator (candle generator, steady-state
                      loop, daily pricing cleanup, backfill)
  db-adapter/         gRPC client for db-adapter (the shared DB-access
                      service); scoped to only the RPCs contentcreator needs
  thirdparty/         ported third-party-service (manufacture/courier
                      schedulers, credit-card-order-service client)
  operator/           ported problem-operator (reconciliation loop,
                      Kubernetes-only, gated — see below)
```

Packages are organized by concern rather than by origin service, since the
whole point of the merge is that the four services' boundaries stop being
real boundaries — e.g. `featureflag.Client` is used by both `operator`'s
`high_cpu_usage` controller and `thirdparty`'s `factory_crisis` check, which
used to be two separate, nearly-identical HTTP clients.

## Resource model: goroutines, not a worker pool

Every recurring job still gets its own goroutine — roughly 15 in total (10
aggregator platform loops, 1 operator reconciliation loop, 2 third-party
schedulers, 1 contentcreator steady-state loop, plus one one-off startup
backfill goroutine). This is deliberate: problem-operator's per-tick
parallel fan-out across controllers, contentcreator's must-not-block startup
backfill, and third-party's fixed-rate-plus-jitter double cadence are
genuinely different concurrency shapes that a shared worker pool would just
have to special-case back apart. Goroutines are cheap; the actual
resource-efficiency win from this merge is one binary, one logger, one HTTP
client stack, and one feature-flag client instead of four independent JVMs/
processes.

## The problem-operator subsystem only runs in Kubernetes

`operator.Enabled()` checks whether `POD_NAMESPACE` is set — the same
variable this subsystem always required, which only Kubernetes' Downward API
sets and which neither `compose.yaml` nor `compose.dev.yaml` ever set. When
it's absent (e.g. under Docker Compose), the operator subsystem is simply
never started; nothing else in the binary is affected.

**Behavior change from the original standalone `problem-operator`:** if
`POD_NAMESPACE` is set but the operator subsystem still fails to initialize
(e.g. no valid in-cluster Kubernetes config), `main.go` logs the error and
keeps running everything else. The original dedicated `problem-operator`
process would panic and crash entirely on the same failure — but in this
merged binary, that would also take down aggregator/content-creator/third-
party's unrelated logic, which is a worse outcome than simply not running
the chaos-injection controller.

## Environment variables

| Variable | Required | Default | Used by |
|---|---|---|---|
| `OFFER_SERVICE_PROTOCOL` | no | `http` | aggregator |
| `OFFER_SERVICE_HOST` | no | `offerservice` | aggregator |
| `OFFER_SERVICE_PORT` | no | `8080` | aggregator |
| `CREDIT_CARD_ORDER_SERVICE_ADDRESS` | yes | — | thirdparty |
| `COURIER_DELAY` / `COURIER_RATE` | yes | — | thirdparty (seconds) |
| `MANUFACTURE_DELAY` / `MANUFACTURE_RATE` | yes | — | thirdparty (seconds) |
| `DB_ADAPTER_SERVICE_ADDRESS` | yes | — | contentcreator (gRPC `host:port` target for db-adapter) |
| `CONTENT_CLEANUP_INTERVAL` | yes | `60` | contentcreator (minutes between hourly stale-data cleanups; daily pricing cleanup runs every ×24) |
| `CONTENT_STALE_AFTER_HOURS` | yes | `24` | contentcreator (age in hours after which Trades / BalanceHistory / non-PRESET Accounts are purged) |
| `FEATURE_FLAG_SERVICE_PROTOCOL` / `_BASE_URL` / `_PORT` | yes | — | operator + thirdparty |
| `SYNC_INTERVAL` | no | `5s` | operator (only read if `POD_NAMESPACE` is set) |
| `POD_NAMESPACE` | — | — | operator's Kubernetes-presence gate; must be *absent* outside Kubernetes |
| `HIGH_CPU_USAGE_BROKER_SERVICE_NAME` / `_FLAG_NAME` / `_CPU_LIMIT` | no | `broker-service` / `high_cpu_usage` / `300m` | operator |

See `.env.example` for a ready-to-copy local dev file.

## Building and testing

```bash
go build .
go test ./...
```

## What's not shared across origins (and why)

- **aggregator's YAML platform config** (`aggregator/config.yaml`) stays a
  structured file, not flattened into `config.Registry` — it's a list of 5
  platforms with per-platform overrides, not a flat variable.
- **contentcreator's steady-state loop** and **third-party's two
  schedulers** are bespoke goroutines rather than `scheduler.Job`s:
  contentcreator needs a self-correcting-to-the-minute sleep (compensating
  for processing time each iteration, not a fixed ticker interval), and
  third-party's schedulers need an initial delay independent of their fixed
  rate, which a single ticker interval can't express.
- **The feature-flag client has no polling/caching layer**, even though the
  original merge brief mentioned "feature-flag polling" as a dedup target —
  neither original implementation (problem-operator's `ServiceConnector` nor
  third-party's OpenFeature-wrapped client) actually polled or cached; both
  fetched fresh on every use. Adding a cache would introduce staleness
  neither original had, so it was deliberately not added.

## contentcreator's DB access now goes through db-adapter

`contentcreator` no longer talks to MSSQL directly — all DB access goes
through `db-adapter`, a separate gRPC service (`.proto` files in
`src/proto/`, one file per table). `db-adapter/` in this repo is a thin,
hand-scoped gRPC client: generated stubs (`db-adapter/proto/`) cover only
`common.proto`, `pricing_service.proto`, `account_service.proto`,
`balance_service.proto`, and `trade_service.proto` — the five proto files
contentcreator actually needs — not the full 37-RPC db-adapter surface.

**Cleanup model changed from size-based to age-based, by deliberate
decision.** The original Java `ContentCreator` capped `Trades`/
`Balancehistory` table size (delete the oldest N rows once a row-count
threshold was exceeded) and handled `Accounts` in two steps — deactivate
excess active accounts, then separately purge already-inactive non-`PRESET`
accounts (`removeExcessiveTradeData`, `removeExcessiveBalanceHistoryData`,
`removeInactiveAccounts`, `removeExcessiveAccounts` in the original
`ContentCreator.java`). db-adapter's proto surface has no RPC to read a
table's row count or delete the oldest N rows, and no accounts-deactivation
RPC — so, per product decision, the model moved to a flat age cutoff: any
`Trade`, `Balancehistory` entry, or non-`PRESET` `Account` older than
`CONTENT_STALE_AFTER_HOURS` (default 24h) is deleted directly (active or not,
no deactivation step), checked every `CONTENT_CLEANUP_INTERVAL` minutes
(default 60; `doEachHour` in `contentcreator/job.go`) rather than once daily.
See
`src/proto/CONTENTCREATOR_MISSING_METHODS.md` for the full history, including
an open assumption about `AccountService.DeleteAccountsOlderThan`'s
before+origin combination semantics that needs confirming against the real
db-adapter server once it exists.
