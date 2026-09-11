# Development

> **Audience:** Engineers making a change to EasyTrade and verifying it locally.

## Run the stack

The root `Makefile` is the entry point. `make help` lists every target.

```bash
make start                                       # whole stack, built from local source
make start services="frontend frontendreverseproxy background-service"
make stop                                        # stop and remove containers
make clean                                       # ...and drop volumes and locally built images
```

The app comes up at <http://localhost>. Give it a few minutes — the frontend will show
errors or missing data until the database seeds and the background jobs have run once.

Dev logins: `james_norton` / `pass_james_123`, or `demouser` / `demopass`. You need money
before you can buy anything, so visit the deposit page first.

## Change one service

```bash
make redeploy services=frontend    # rebuild the image, then recreate the container
make restart  services=frontend    # recreate without rebuilding
```

`restart` and `redeploy` act on exactly one service and will fail without `services=`.
Every other compose target accepts `services=` optionally — a single name or a quoted,
space-separated list — and acts on the whole stack when omitted. `SERVICES=` works as
an alias.

## Direct host ports

`compose.dev.yaml` publishes each service so you can hit it without going through nginx:

| Service | Port | | Service | Port |
|---|---|---|---|---|
| `pricing-service` | 8083 | | `frontend` | 8092 |
| `broker-service` | 8084 | | `feature-flag-service` | 8094 |
| `offerservice` | 8087 | | `background-service` | 8095 |
| `user-service` | 8089 | | `db-adapter` | 8096 (HTTP), 50051 (gRPC) |
| `credit-card-order-service` | 8091 | | `loadgen` | 8097 |
| `db` | 1433 / 5432 | | | |

## Build and test per stack

```bash
# Go — from the service directory
go build .
go test ./...
go test ./path/to/pkg -run TestName

# TypeScript / Node.js — from the service directory
npm install
npm run build
npm test          # vitest (frontend)
npm run lint

# Java — from src/credit-card-order-service/
./gradlew build
./gradlew test --tests "com.dynatrace.easytrade.SomeTest"

# .NET — from src/broker-service/
dotnet build
dotnet test --filter "FullyQualifiedName~SomeTest"
```

Run the relevant build **and** lint for the stack you touched before calling a change
done. If it fails, fix it — do not skip or suppress.

## Frontend dev server

`compose.dev.yaml` builds the frontend from `Dockerfile.dev` and bind-mounts
`src/frontend/src` read-only, so edits are picked up live.

Running `npm run dev` outside compose serves on port 3000, but API calls will have
nowhere to go — in production they are resolved by nginx under the same origin. Either
route them manually or run the full compose stack.

## Changing a `.proto` contract

`src/proto/` is shared by four language stacks and stubs are generated at build time,
not committed. After editing a contract, regenerate for **every** consuming service:

```bash
make generate-proto                     # every service with a generate-proto.sh
make generate-proto service=db-adapter  # just one
```

Then rebuild the .NET, Java, and Node consumers — their generators run as part of their
normal build.

## Switching the database backend

Set `DB_TYPE` and the matching `DB_URL` in `.env`, then rebuild:

```bash
make clean              # volumes carry the old schema — drop them
make start
```

`DB_TYPE` selects both the `db-adapter` backend and which image the `db` container is
built from (`src/db/${DB_TYPE}/`).

## Toggling a problem pattern while developing

```bash
curl -X PUT "http://localhost/feature-flag-service/v1/flags/factory_crisis/" \
  -H "accept: application/json" -d '{"enabled": true}'
```

See [Problem patterns](problem-patterns/index.md) for what each one does and how long
the effect takes to appear and clear.

## Deploy to Kubernetes

```bash
make k8s-install          # from the local chart in helm/easytrade
make k8s-install-remote   # from the published OCI chart
make k8s-uninstall
```

Both install targets are `helm upgrade --install`, so re-running one upgrades in place.
Release name and namespace both default to `easytrade` and can be overridden:

```bash
make k8s-install HELM_RELEASE=easytrade-test HELM_NAMESPACE=easytrade-test
```

Kubernetes is the only target where `background-service`'s operator subsystem runs.

## House rules

- Never commit secrets, tokens, or credentials — use environment variables.
- Do not edit `compose.yaml` (registry images) when you mean `compose.dev.yaml` (local
  source), or `compose.build.yaml` (CI image builds).
- Apply a dependency or vulnerability fix across every affected service in one pass.
- Do not hand-edit the dependency graph block in `README.md` — run `make update-graph`.
