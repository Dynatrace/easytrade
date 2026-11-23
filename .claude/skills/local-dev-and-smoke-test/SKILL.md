---
name: local-dev-and-smoke-test
description: >
  Start EasyTrade locally with Docker Compose (via the root Makefile) and verify the stack is healthy
  with smoke tests built from each service's .http file. Trigger phrases: "run locally", "start the stack",
  "smoke test", "verify the stack", "build and run with docker", "make sure nothing is broken".
---

Start the local stack and confirm it is healthy end to end. Use the root `Makefile`
(`make help` lists every target)

## Prerequisites

- `docker compose version` works (Compose plugin) and the daemon is running.
- Ports free on localhost: `80` (reverse-proxy) plus the service ports below. Check with `ss -ltn | grep -E ':(80|8083|8084|8087|8089|8091|8094|8095|8096|8097|8092|50051)\s'`.
- `.env` exists in the repo root (DB backend is MSSQL by default, Postgres via `DB_TYPE`/`DB_URL`).

## 1. Build and start

```bash
make start                                  # all 12 services, built from local source (compose.dev.yaml)
make start services="frontend reverse-proxy background-service"   # subset
make build services=<name>                  # rebuild image(s) only
make redeploy services=<name>               # rebuild + recreate one service after a code change
make stop                                   # tear down; `make clean` also deletes volumes and local images
```

`compose.dev.yaml` is the local-source file; do not use or edit `compose.yaml` (registry images) for this.
`make start-remote` runs the pre-built registry images instead.

Containers have no healthchecks, so "Up" does not mean ready. MSSQL takes ~15-20 s to initialise and
`db-adapter`, `user-service`, `offer-service` log connection-refused / "database not found" retries
until it does. That start-up noise is expected. Wait until the DB-backed endpoints answer, don't `sleep` blindly:

```bash
until curl -sf http://localhost:8089/api/accounts/presets >/dev/null; do sleep 3; done
docker compose -f compose.dev.yaml ps -a --format 'table {{.Service}}\t{{.Status}}'
docker inspect -f '{{.Name}} restarts={{.RestartCount}}' $(docker compose -f compose.dev.yaml ps -aq)
```

Expect 12 services Up (`background-service`, `broker-service`, `credit-card-order-service`, `db`, `db-adapter`,
`feature-flag-service`, `frontend`, `loadgen`, `offer-service`, `pricing-service`, `reverse-proxy`, `user-service`),
none exited, restart counts 0.

## 2. Smoke test with the services' `.http` files

Every service ships a dedicated `.http` file that documents its REST API. **Use these files for the
smoke test instead of hand-written curl calls**, so the test follows whatever the file says the API is:

| Service | File | Host port (direct) | Proxy path on :80 |
|---|---|---|---|
| `feature-flag-service` | `src/feature-flag-service/feature-flag-service.http` | 8094 | `/feature-flag-service` |
| `user-service` | `src/user-service/user-service.http` | 8089 | `/user-service` |
| `broker-service` | `src/broker-service/broker-service.http` | 8084 | `/broker-service` |
| `pricing-service` | `src/pricing-service/pricing-service.http` | 8083 | `/pricing-service` |
| `offer-service` | `src/offer-service/offer-service.http` | 8087 | `/offer-service` |
| `credit-card-order-service` | `src/credit-card-order-service/credit-card-order-service.http` | 8091 | `/credit-card-order-service` |
| `background-service` | `src/background-service/background-service.http` | 8095 (container 8080) | `/background-service` |

`db-adapter` (8096, gRPC on 50051), `loadgen` (8097) and `frontend` (8092 dev server, served on `/`) have no `.http` file.

How to run them:
- Each file has `@baseUrl = http://localhost:<port>` and `###`-separated requests, executed top to bottom.
  Run every request through any `.http`-capable runner available (IDE REST client, JetBrains HTTP client CLI,
  httpyac, or a small script that executes the file as written). Do not install a new tool without the user's OK.
- Run every request in every file; record status code and a short body excerpt per request.
- Also confirm `GET /` on `http://localhost` returns 200 (frontend through the proxy), and that one request per
  service works through the proxy path (`http://localhost/<proxy-path>/...`), which is how the app really calls them.

Variables in the files: ids that are fixed in the seed data (`@instrumentId`, package ids) are filled in. Ids that are
generated at startup are placeholders you must set before running: `@accountId` (broker, user, credit-card-order files;
take it from the `Login` response) and `@orderId` (credit-card-order file; from the `Create a new credit card order`
response, `results.creditCardOrderId`). Run a copy of each file with these substituted rather than editing the repo files.
A credit card order exists at most once per account, so delete it (`DELETE /v1/orders/{accountId}`) before re-running create.
`Signup` requests 409 on a repeat run because usernames are unique; change `username`/`email` or accept the 409.

Judging results:
- A request returning 2xx = pass. Version endpoints returning `{{BUILD_VERSION}}` placeholders is normal locally.
- A non-2xx result is **not automatically a service bug**. The files contain placeholder values (zero GUIDs, ids that
  don't exist, old numeric ids). For each failure decide: (a) stale/placeholder request in the `.http` file, or
  (b) a real service problem. Confirm by re-running the same call with valid data, taken from the live stack:
  - account id: `POST /api/auth/login` on `user-service` with `james_norton` / `pass_james_123` (also `demouser` / `demopass`)
  - instrument id: a GUID from `GET /v1/prices/latest` or `GET /v1/instrument?accountId=<id>` (ids look like `c0000000-0000-4000-8000-0000000000NN`)
  - package id: a GUID from `GET /api/offers/<platform>` (`a0000000-0000-4000-8000-00000000000N`)
- All ids in the current API are UUID strings. Numeric ids (`15`, `1`) in a request are stale.
- Several requests mutate local state (deposits, trades, credit card orders, signups, flag toggles). That is fine
  on the throwaway dev DB. Leave flags disabled afterwards and delete orders you created (`DELETE /v1/orders/{accountId}`).
- `GET /v1/instrument` without `accountId` returns `{"results":[]}` by design.
- The Java `credit-card-order-service` rejects `GET /version` without an `Accept` header (400). Its `.http` file now sends
  `Accept: application/json`; keep that header on any hand-made call to that endpoint.

**Report every issue found when using the `.http` files** (stale request, wrong port, wrong body, or a service
that rejects the documented call), with file, request name, what was sent, what came back, and the fix. Do not
silently edit the `.http` files unless the user asks; list the proposed corrections.

## 3. Check the logs

```bash
docker compose -f compose.dev.yaml logs --no-color --since 90s | grep -iE "error|exception|panic|fatal"
```

- Ignore: start-up DB retries (first ~20 s), `loadgen` lines containing `_error` (intentional failure scenarios),
  and frontend Vite lines mentioning `ErrorPage.tsx`.
- Anything still erroring after the DB is up (re-check with `--since 20s`) is a real issue to diagnose.

## 4. Frontend unit tests

```bash
cd src/frontend && npm install && npm test -- --run
```

Expect all vitest files to pass.

## 5. Report

Give pass/fail per service (from the `.http` runs), the container status, log findings, the frontend test result,
and the list of `.http` issues. If something fails, diagnose before declaring done:

| Symptom | Likely cause | Fix |
|---|---|---|
| Port 80 / 80xx already in use | Another proxy or stack running | `ss -ltnp`, stop it, or `make stop` |
| DB connection / "Cannot open database" errors | `db` still initialising | Wait ~20 s; `docker compose -f compose.dev.yaml logs db db-adapter` |
| 502 from the proxy | Upstream crashed or not started | `docker compose -f compose.dev.yaml logs <service>` |
| gRPC `INVALID_ARGUMENT` from `credit-card-order-service` | Non-UUID account id sent | Use a UUID account id |
| Old behaviour after a code change | Stale image | `make redeploy services=<name>` |

Stop the stack only if the user asks (`make stop`).
