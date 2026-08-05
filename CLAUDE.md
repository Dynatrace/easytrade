<!-- SYNC NOTICE. This file is the primary context source for Claude Code.
     Rules files live in .claude/rules/ — load automatically when editing matching files.
     If Copilot is also used, mirror this file in .github/copilot-instructions.md
     and mirror .claude/rules/*.md in .github/instructions/*.instructions.md. -->

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
Detailed per-language conventions live in `.claude/rules/`.

## What is EasyTrade

Fake stock-broking demo application for Dynatrace showcases. 18 microservices communicate over REST (mostly JSON; some services also accept XML). All traffic routes through an nginx reverse proxy (`frontendreverseproxy`) on port 80. A RabbitMQ queue (`Trade_Data_Raw`) carries trade data from `pricing-service` to `calculationservice`.

All services share one MSSQL database (`db`, port 1433). Connection string format differs by tech stack — see `compose.yaml` for the three variants (Java/JDBC, .NET, Go/sqlserver).

## Tech stacks

| Stack | Services |
|---|---|
| Java 21 / Spring Boot / Gradle | `contentcreator`, `credit-card-order-service`, `engine`, `feature-flag-service`, `third-party-service` |
| Go + Go Modules | `aggregator-service`, `pricing-service`, `problem-operator`, `user-service` |
| TypeScript / Node.js / npm | `frontend` (React + Vite), `loadgen`, `offerservice` (Express) |
| C# / .NET 8 | `broker-service`, `manager` |
| Config only | `calculationservice` (C++, Dockerfile-only), `frontendreverseproxy` (nginx), `rabbitmq`, `db` (MSSQL) |

Key roles:
- `aggregator-service`: generates synthetic traffic by calling other services over REST (50% JSON, 50% XML); no direct DB access
- `pricing-service`: REST API (Gin + GORM) + RabbitMQ publisher; Swagger at `/pricing-service/swagger-ui/index.html`
- `broker-service`: core trading engine (engine service was merged into it on branch `DREL-7889`); uses EF Core + feature-flag-driven middleware (`HighCpuUsageMiddleware`, `CreditCardValidationMiddleware`)
- `problem-operator`: Kubernetes-only controller (`k8s.io/client-go`); watches feature flags and applies chaos patterns to the cluster — not present in `compose.yaml`
- `calculationservice`: C++ binary built only in Dockerfile; consumes RabbitMQ queue

## Build & test per stack

**Java (run from service directory):**
```bash
./gradlew build        # compile + test
./gradlew test         # tests only
./gradlew test --tests "com.dynatrace.easytrade.SomeTest"  # single test
```

**Go (run from service directory):**
```bash
go build .
go test ./...
go test ./path/to/pkg -run TestName
```

**TypeScript/Node.js (run from service directory):**
```bash
npm install
npm run build   # tsc / vite build
npm test        # vitest (frontend) or jest
npm run lint    # eslint
```

**C# / .NET:**
```bash
# Run from the solution directory: src/<service>/<ServiceName>/
dotnet build
dotnet test                        # runs xunit tests in test/ project
dotnet test --filter "FullyQualifiedName~SomeTest"
```
Solution paths: `src/broker-service/BrokerService/`, `src/loginservice/`, `src/manager/easyTradeManager/`.
Only `broker-service` has a test project; `loginservice` and `manager` have no unit tests.

## Running locally

Use `compose.dev.yaml` via the helper script:
```bash
./runDev.sh start       # proxy + contentcreator (minimal)
./runDev.sh start-all   # all services
./runDev.sh build [service...]  # rebuild images
./runDev.sh stop
```

Or directly:
```bash
docker compose -f compose.dev.yaml up -d
docker compose up          # uses pre-built images from registry (compose.yaml)
```

App available at `http://localhost`. Dev credentials: `demouser/demopass`, `james_norton/pass_james_123`.

Frontend dev server runs on port 3000 (`npm run dev` in `src/frontend/`). API calls go through nginx in production; in dev mode they must be routed manually or via the full compose stack.

## Dependency management & vulnerability fixes

All Java services share the same `build.gradle` structure. Transitive dep bumps go in a marked block:
```groovy
// -- not direct dependencies but need bumps to patch vulns
// -- can be removed once the parent packages upgrade
```
Apply the same bump to **all** affected `build.gradle` files in one pass.

For Go, stdlib vulns require bumping the `go` directive in `go.mod`, the builder image tag+digest in `Dockerfile`, then running `go mod tidy`.

For Node, use `overrides` in `package.json` to pin transitive deps; run `npm install` after.

## Feature flags / problem patterns

Feature flags control four problem patterns (`DbNotResponding`, `ErgoAggregatorSlowdown`, `FactoryCrisis`, `HighCpuUsage`). Toggle via:
```bash
curl -X PUT "http://localhost/feature-flag-service/v1/flags/{flagId}/" \
  -H "accept: application/json" -d '{"enabled": true}'
```
Swagger: `http://localhost/feature-flag-service/swagger-ui/index.html`

## Dynatrace / Observability

Services are deployed on Kubernetes (namespace `easytrade`) and monitored by Dynatrace. See `AGENTS.md` for DQL query patterns, metric keys, and problem investigation workflow. Monaco configurations live in `./monaco/`.

Key DQL rule: always use `timeseries` for metrics — never `fetch <metric-key>`.

## Helm / Kubernetes

```bash
helm install easytrade oci://europe-docker.pkg.dev/dynatrace-demoability/helm/easytrade \
  --create-namespace --namespace easytrade
helm uninstall easytrade -n easytrade
```

## Conventions

- NEVER commit secrets, tokens, or credentials — use environment variables
- NEVER use `fetch <metric-key>` in DQL queries — always use `timeseries`
- Do NOT apply a dep bump to one `build.gradle` without applying it to all affected Java services
- Do NOT modify `compose.yaml` (pre-built registry images) when you mean `compose.dev.yaml` (local dev)
- Apply vulnerability fixes across all services in a single pass — partial updates leave the repo inconsistent

## Validation

Run the relevant build and lint command for the affected stack before declaring any task complete.
If the build or lint fails, fix the failure — do not skip or suppress.

## Self-Healing

If you encounter a pattern in the codebase that contradicts these instructions, flag the discrepancy before proceeding. If `.claude/rules/*.md` files have drifted from the actual codebase patterns, flag it.

## Instruction Sync

| Claude Code source | Mirror (if Copilot used) |
|---|---|
| `CLAUDE.md` | `.github/copilot-instructions.md` |
| `.claude/rules/*.md` | `.github/instructions/*.instructions.md` |
