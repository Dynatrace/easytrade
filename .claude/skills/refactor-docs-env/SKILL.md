---
name: refactor-docs-env
description: Refactor ONE service's outbound env vars (consolidate per-dependency host/port/protocol vars into a single SERVICE_ADDRESS var) and its API documentation (remove swagger/extended API docs, add a .http file). Scoped to a single service per invocation.
---

## ARGS
SERVICE_NAME: Name of the service to refactor (e.g., broker-service, pricing-service, user-service, feature-flag-service)

## Scope guardrail

This skill touches exactly one service per run: `SERVICE_NAME`.

- Only modify files inside `src/<SERVICE_NAME>/...`, plus `SERVICE_NAME`'s own entries in `compose.dev.yaml`, `compose.yaml`, and `helm/easytrade/values.yaml`.
- Do NOT touch another service's files or env blocks, even if it happens to call the same dependency (e.g. both `broker-service` and `credit-card-order-service` may call `feature-flag-service` with the same old-style vars — fix only the one named in `SERVICE_NAME`, run the skill again separately for the other).
- If `SERVICE_NAME` has no outbound dependencies, or no swagger/API docs, skip the corresponding part below rather than forcing a change.

## Part 1 — Unify outbound address env vars

`SERVICE_NAME` may call other services using several legacy env var patterns. Find all of them first:

- `<DEP>_HOSTANDPORT` (single var, bare `host:port`)
- `<DEP>_HOST` + `<DEP>_PORT` (two vars)
- `<DEP>_PROTOCOL` + `<DEP>_BASE_URL` + `<DEP>_PORT` (three vars)
- `<DEP>_BASE_URL` + `<DEP>_PORT` (protocol hardcoded elsewhere in code)

Grep `src/<SERVICE_NAME>/` for `_HOSTANDPORT`, `_HOST`, `_PORT`, `_PROTOCOL`, `_BASE_URL` to enumerate every dependency this service addresses this way.

For each distinct dependency `DEP`, consolidate to **one** var: `<DEP>_ADDRESS`.

- Default: a ready-to-use full URL — `protocol://host:port` (e.g. `PRICING_SERVICE_ADDRESS=http://pricing-service:8080`). No parsing, concatenation, or reassembly should be needed on the consuming side.
- Exception — gRPC dependencies: use bare `host:port`, no protocol prefix (gRPC client constructors expect this). Follow the existing correct example: `DB_ADAPTER_ADDRESS=db-adapter:8080`, consumed directly by `grpc.NewClient(addr, ...)` in `src/user-service/main.go`.

Update the code:

- Replace every call site that builds a URL from the old parts (e.g. C#/Java: `$"{protocol}://{baseUrl}:{port}/v1/"`, Go: `fmt.Sprintf("%s://%s:%d/...", ...)`) with **direct use of the new single value**.
- Watch for double-prefixing: if a call site used to do `$"http://{configValue}/"` against an old bare-`host:port` var, and the new var is already a full URL, that line must change to use the value as-is — otherwise you get `http://http://...`.
- After renaming, grep the **whole service tree** (not just the constants file) for every remaining reference to the old var/constant names — other classes (e.g. separate connector/client classes) commonly reference the same constant and will silently break or misbehave if missed.

Update config:

- Update `SERVICE_NAME`'s own env block in `compose.dev.yaml`, `compose.yaml`, and `helm/easytrade/values.yaml` — all three define env vars per service and drift independently, so all three need the rename.
- Remove the now-unused old var declarations from these blocks.
- Update `.env.example` and any README env-var table for this service to match.

## Part 2 — Remove swagger + extended API docs, add a `.http` file

Remove, if present (check each independently — code, docs, and Dockerfile can be out of sync with each other):

- Swagger/OpenAPI package dependency (e.g. `Swashbuckle.AspNetCore` in a `.csproj`, `springdoc`/`swaggo` deps)
- Swagger route/middleware wiring in code (e.g. `AddSwaggerGen`/`UseSwaggerUI` in .NET, `ginSwagger`/`swaggerFiles` routes in Go)
- Generated doc files (e.g. `docs/swagger.json`, `docs/swagger.yaml`, `docs/docs.go`)
- Any swagger-generation step in the service's `Dockerfile`

Trim the service's `README.md`:

- Remove the "Swagger" section and the endpoint/API-documentation section(s).
- Keep everything else (setup, running locally, env vars, etc.).

Add or refresh `<service-name>.http` at the service root (reuse the existing file if one is already there, e.g. `src/user-service/user-service.http`, `src/offerservice/requests.http`, just update its content):

- Define `@baseUrl = http://localhost:<port>` at the top.
- Separate requests with `###`, optionally followed by a short comment naming the request/resource.
- Each request must be self-contained and succeed independent of app state, or explicitly assume a one-time init has already happened (e.g. signup before login) — don't chain requests that depend on a prior request's response.
- Cover general functionality, not every edge case — and don't create the file if the only endpoint is `/version`.
- Include the login/signup flow if the service has auth, matching the style already used in `user-service.http`.

## Validation

Run the build/test command for `SERVICE_NAME`'s stack before declaring the task complete (per root `CLAUDE.md`):

- C#: `dotnet build` (and `dotnet test` if a test project exists) from the solution directory
- Go: `go build .` and `go test ./...`
- Java: `./gradlew build`
- Node/TS: `npm run build` and `npm test`

Fix any failure — do not skip or suppress it.
