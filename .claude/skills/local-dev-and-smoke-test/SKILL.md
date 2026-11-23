---
name: local-dev-and-smoke-test
description: >
  Start the legacy (1.x) EasyTrade stack locally with Docker Compose via ./runDev.sh and verify it is
  healthy with smoke tests against the REST APIs. Trigger phrases: "run locally", "start the stack",
  "smoke test", "verify the stack", "build and run with docker", "make sure nothing is broken".
---

Start the local stack and confirm it is healthy end to end. This is the **1.x** layout (18 containers,
`./runDev.sh`, `compose.dev.yaml`). The 2.x layout on `main` uses the root `Makefile` instead.

## Prerequisites

- `docker compose version` works (Compose plugin) and the daemon is running.
- Port `80` is free: `ss -ltn | grep -E ':80\s' || echo free`. The 2.x stack uses the same ports
  (80, 1433, 5432, 8083-8097, 50051) and the same `easytrade` compose project name, so **stop it first**
  (`docker compose -f compose.dev.yaml down --remove-orphans` or `./runDev.sh stop`). Named volumes survive.
  Ask the user before stopping a stack that is already running.

## 1. Build and start

```bash
./runDev.sh build               # rebuild all images (do this when switching from main: images share the easytrade-* names)
./runDev.sh build <service>     # rebuild a single service
./runDev.sh start-all           # all services
./runDev.sh start               # minimal: frontendreverseproxy + contentcreator + engine
./runDev.sh stop                # down --remove-orphans
```

Containers have no healthchecks, so "Up" does not mean ready; the DB seeds on first start. Poll instead of
sleeping, using endpoints that need the DB (use the exact paths below, a wrong path polls forever):

```bash
timeout 150 bash -c 'until curl -sf http://localhost/feature-flag-service/v1/flags >/dev/null \
  && curl -sf http://localhost/broker-service/v1/instrument >/dev/null; do sleep 3; done'
docker compose -f compose.dev.yaml ps --format 'table {{.Name}}\t{{.Status}}'
```

Expect 18 containers Up: `accountservice`, `aggregator-service`, `broker-service`, `calculationservice`,
`contentcreator`, `credit-card-order-service`, `db`, `engine`, `feature-flag-service`, `frontend`,
`frontendreverseproxy`, `loadgen`, `loginservice`, `manager`, `offerservice`, `pricing-service`, `rabbitmq`,
`third-party-service`.

## 2. Smoke tests

Everything goes through the proxy on port 80. Routes are **case- and slash-sensitive**: no trailing slash,
and list endpoints wrap their data in `{"results": [...]}`. Each check expects HTTP 200 and the shown value.

| # | Check | Command | Expect |
|---|---|---|---|
| 1 | Feature flags | `curl -sf http://localhost/feature-flag-service/v1/flags \| jq '.results\|length'` | number > 0 (7 today) |
| 2 | Account | `curl -sf http://localhost/accountservice/api/accounts/6 \| jq -r '.firstName'` | `James` |
| 3 | Instruments | `curl -sf http://localhost/broker-service/v1/instrument \| jq '.results\|length'` | number > 0 (15 today) |
| 4 | Login | `curl -sf -X POST http://localhost/loginservice/api/login -H 'Content-Type: application/json' -d '{"username":"james_norton","password":"pass_james_123"}' \| jq '.id'` | `6` |
| 5 | Prices | `curl -sf http://localhost/pricing-service/v1/prices/latest \| jq '.results\|length'` | number > 0 (15 today) |
| 6 | Frontend | `curl -s -o /dev/null -w '%{http_code}' http://localhost/` | `200` |

Other useful routes: `/accountservice/api/accounts/presets` (all demo accounts),
version endpoints: `/feature-flag-service/version`, `/pricing-service/version`, `/engine/api/version`,
`/accountservice/api/version` (engine and accountservice only expose it under `/api`).

Routes that do **not** exist in 1.x (they belong to 2.x, or were guesses): `/accountservice/v1/accounts/`,
`/engine/v2/instruments/`, `/pricing-service/v1/prices/`, `/feature-flag-service/v1/flags/` with a trailing slash.
Instruments are served by `broker-service` (singular `instrument`), not `engine`.
If a route is unclear, read the controller: `@RequestMapping`/`@GetMapping` (Java), `router.go` (Go),
`[Route]` attributes (C#), and `src/frontendreverseproxy/nginx.conf` for the proxy prefixes.

## 3. Frontend unit tests

```bash
cd src/frontend && npm install && npm test -- --run
```

**Known baseline on 1.x:** 2 files fail, 13 tests fail / 27 pass, all with
`TypeError: RequestInit: Expected signal to be an instance of AbortSignal` (jsdom vs Node undici in
react-router's `createMemoryRouter`). This is pre-existing and independent of dependency bumps. Treat any
result *worse* than 13 failures as a regression; do not report the run as fully green.

## 4. Report

Show pass/fail for each check and the test summary. If something fails, diagnose before reporting:

| Symptom | Likely cause | Fix |
|---|---|---|
| Port 80 already in use | 2.x stack or another proxy running | stop it (ask first), or `sudo lsof -i :80` |
| 404 on a smoke URL | wrong 1.x route / trailing slash | use the table above; check the controller |
| 502 from proxy | service crashed or still starting | `docker compose -f compose.dev.yaml logs <service>` |
| DB connection errors at start | `db` still initialising | wait/poll; `docker compose -f compose.dev.yaml logs db` |
| Behaviour looks like 2.x / stale | image from `main` reused | `./runDev.sh build` then `./runDev.sh start-all` |

## 5. Stop (only if requested)

```bash
./runDev.sh stop
```
