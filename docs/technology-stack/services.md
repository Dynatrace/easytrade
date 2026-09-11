# Service reference

> **Audience:** Anyone who needs to find the right service quickly.

Twelve directories under `src/`. Every service listens on `8080` internally;
`compose.dev.yaml` publishes each on a distinct host port so you can bypass nginx
during development.

| Service | Stack | Proxy path | Dev host port | Role |
|---|---|---|---|---|
| `frontendreverseproxy` | nginx | — | 80 | Single entry point; routes every path prefix |
| `frontend` | React 18 + Vite | `/` | 8092 | The trading UI, including the problem-pattern switches |
| `broker-service` | .NET 8 | `/broker-service` | 8084 | Core trading engine: trades, balances, instruments, portfolio history |
| `user-service` | Go + Gin | `/user-service` | 8089 | Authentication and account management |
| `pricing-service` | Go + Gin | `/pricing-service` | 8083 | Instrument prices and candles; Swagger UI |
| `offerservice` | Node + Express 5 | `/offerservice` | 8087 | Public product/package catalogue and signup, for the simulated platforms |
| `credit-card-order-service` | Java 21 + Spring Boot | `/credit-card-order-service` | 8091 | Credit-card ordering and order status |
| `feature-flag-service` | Go | `/feature-flag-service` | 8094 | In-memory flag store; Swagger UI |
| `background-service` | Go | `/background-service` | 8095 | Synthetic traffic, candles, card manufacture, K8s chaos operator |
| `db-adapter` | Go + GORM | — | 50051 (gRPC), 8096 | The only service that talks to the database |
| `db` | MSSQL or Postgres | — | 1433 / 5432 | Schema and seed data |
| `loadgen` | Node + Puppeteer | — | 8097 | Drives the public UI with realistic browser sessions |

## Notes per service

### `frontendreverseproxy`
nginx with a `location` block per service prefix, plus `location /` for the frontend.
Everything the browser touches goes through port 80, which is what makes EasyTrade look
like a single application to real-user monitoring.

### `broker-service`
The trading engine. Hosts two of the six problem patterns
([HighCpuUsage](../problem-patterns/high-cpu-usage.md),
[DbNotResponding](../problem-patterns/db-not-responding.md)) and the
[CreditCardValidation](../problem-patterns/credit-card-validation.md) middleware.
Also runs `LongTradeSchedulerService`, which closes long trades when they expire.
Depends on `user-service`, `pricing-service`, `feature-flag-service`, and `db-adapter`.

### `pricing-service`
Prices come from `db-adapter` over gRPC — despite older notes to the contrary, it holds
no ORM and no direct database connection. Accepts XML as well as JSON.
Swagger: `/pricing-service/swagger-ui/index.html`.

### `offerservice`
The one service whose *purpose* is to be called by the simulated platforms rather than
by the frontend. It fronts `db-adapter` for products and packages and `user-service` for
signup, and hosts the
[ErgoAggregatorSlowdown](../problem-patterns/ergo-aggregator-slowdown.md) middleware.
Accepts `application/xml` and `text/xml`.

### `credit-card-order-service`
Spring Boot. Accepts `application/xml`. Hosts
[CreditCardMeltdown](../problem-patterns/credit-card-meltdown.md), and hands each new
order to `background-service`'s `/v1/manufacturer` endpoint.

### `background-service`
One Go binary consolidating four former services. Four independent subsystems:

| Subsystem | What it does |
|---|---|
| `aggregator` | 5 simulated trading platforms polling `offerservice` (50/50 JSON/XML) and signing up fake users — 10 goroutines total |
| `contentcreator` | Per-minute OHLC candles for 15 instruments; purges stale trades, balance history, and accounts |
| `thirdparty` | Credit-card manufacture and courier delivery; serves `/v1/manufacturer` and `/version` |
| `operator` | Kubernetes-only chaos controller, gated on `POD_NAMESPACE`; no-ops outside a cluster |

### `db-adapter`
Every other service's route to storage. gRPC on `50051`, health on `8080`. The gRPC
layer depends only on interfaces, so a new SQL dialect is added without touching the
server layer. See [Data layer](data-layer.md).

### `loadgen`
Puppeteer sessions built on `@demoability/loadgen-core`, driving five scripted
journeys: `depositAndBuy`, `depositAndLongBuy`, `longSell`, `orderCreditCard`,
`sellAndWithdraw`. This is what generates the real-user monitoring data.

## XML-capable services

Content type is negotiated from the `Accept` and `Content-Type` headers.

| Service | Accepted XML MIME types |
|---|---|
| `credit-card-order-service` | `application/xml` |
| `offerservice` | `application/xml`, `text/xml` |
| `pricing-service` | `application/xml` |
