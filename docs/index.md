# EasyTrade

> **Audience:** Engineers working on EasyTrade, and anyone using it to demo or test Dynatrace.

EasyTrade is a fake stock-broking application. Users sign up, deposit money, and buy
and sell instruments whose prices move on a synthetic 24-hour cycle. None of the data
is real — the point of the application is to produce realistic, continuously-flowing
microservice traffic that Dynatrace can observe, and to be able to **break that traffic
on demand** in well-understood ways.

That second part is what makes EasyTrade different from an ordinary demo app, so this
documentation starts there.

## Start here

| If you want to… | Read |
|---|---|
| Understand the failure scenarios EasyTrade can simulate | [Problem patterns](problem-patterns/index.md) |
| Know what each service is written in and how to build it | [Technology stack](technology-stack/index.md) |
| See how requests and data flow between services | [Architecture](architecture.md) |
| Run the stack locally and make a change | [Development](development.md) |
| Query EasyTrade data in Dynatrace | [Observability](observability.md) |

## The application in one paragraph

Twelve services in four languages sit behind a single nginx reverse proxy on port 80.
The React frontend and every backend API are reachable under that one origin. No service
talks to the database directly any more: all persistence goes through **db-adapter**, a Go
gRPC service that fronts either MSSQL or Postgres. Traffic never stops, because
**background-service** continuously simulates external trading platforms polling for
offers, generates price candles, and drives credit-card manufacture and delivery, while
**loadgen** drives the public HTTP endpoints. A dedicated **feature-flag-service** holds
the switches that turn each problem pattern on and off.

## Repository shape

```
compose.yaml         pre-built registry images
compose.dev.yaml     built from local source — the dev stack
compose.build.yaml   builds and tags images for the registry (CI)
Makefile             the entrypoint for all of the above; `make help`
helm/easytrade/      Helm chart for Kubernetes deployment
monaco/              Dynatrace configuration-as-code
src/<service>/       one directory per service, each with its own README
src/proto/           shared .proto contracts for the gRPC services
src/db/<mssql|postgres>/  schema and seed data per backend
docs/                this documentation
```

## Ownership

| | |
|---|---|
| Catalog entity | `component:default/easytrade` |
| System | `demoability` |
| Owner | `team-demoability` |
| Source | <https://github.com/Dynatrace/easytrade> |
