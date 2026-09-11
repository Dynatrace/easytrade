# Observability

> **Audience:** Engineers analysing EasyTrade in Dynatrace.

EasyTrade exists to be observed. Its value comes from the combination of continuous,
realistic traffic and [problem patterns](problem-patterns/index.md) that break that
traffic in known ways — so most observability work here is about reading a *change* in a
steady signal, not about finding a signal at all.

## Deployment

Demo environments run on Kubernetes in the namespace `easytrade`, monitored by
Dynatrace. Under Docker Compose you need a OneAgent on the host running the stack.

## Querying with DQL

**Always use `timeseries` for metrics. Never `fetch <metric-key>`.** `fetch` against a
metric key does not do what it looks like it does, and the results will mislead you.

```dql
timeseries avg(dt.host.cpu.usage), by: { dt.entity.host }
```

## What each problem pattern looks like

| Pattern | Primary signal | Where to look |
|---|---|---|
| [DbNotResponding](problem-patterns/db-not-responding.md) | Failure-rate spike on trade creation, root cause at the database tier | `broker-service` service-level failure rate; distributed traces into `db-adapter` |
| [ErgoAggregatorSlowdown](problem-patterns/ergo-aggregator-slowdown.md) | 150 s response-time spike on `offerservice`, then a ~40 % request-count drop for 15 min | `offerservice` request count and response time |
| [FactoryCrisis](problem-patterns/factory-crisis.md) | No errors — a business process stops advancing | Credit-card order status; business events |
| [HighCpuUsage](problem-patterns/high-cpu-usage.md) | Response time +~700 ms per request, CPU saturation, and CPU throttling on K8s | `broker-service` CPU and response time; pod throttling metrics |
| [CreditCardMeltdown](problem-patterns/credit-card-meltdown.md) | Unhandled `ArithmeticException` reaching the browser | `credit-card-order-service` exceptions; real-user monitoring errors |
| [CreditCardValidation](problem-patterns/credit-card-validation.md) | HTTP 400s on deposit/withdraw, plus a new outbound dependency | `broker-service` `/v1/balance/*` endpoints |

For patterns with a delayed effect, read the timing notes on the individual page before
concluding a demo has failed — ErgoAggregatorSlowdown in particular takes ~150 seconds
to show its first symptom and keeps affecting traffic for up to 15 minutes *after* the
flag is turned off.

## Real-user monitoring

`loadgen` drives the real frontend with Puppeteer, so RUM data is genuine browser
traffic across five journeys: `depositAndBuy`, `depositAndLongBuy`, `longSell`,
`orderCreditCard`, `sellAndWithdraw`. Point it at the stack with `EASYTRADE_URL` and
scale it with `CONCURRENCY`.

## Business events

EasyTrade was built in part to showcase business events, which can be produced two ways:

- **Directly**, using a Dynatrace SDK in the service code;
- **Indirectly**, by configuring capture rules on requests Dynatrace already monitors.

[FactoryCrisis](problem-patterns/factory-crisis.md) is the pattern that shows this best,
because the failure is invisible in technical signals and only obvious in the business
process.

## Configuration as code

Dynatrace configuration for EasyTrade lives in `./monaco/` and is applied with
[Monaco](https://github.com/Dynatrace/dynatrace-configuration-as-code). That
configuration is currently out of date and is not documented here yet.
