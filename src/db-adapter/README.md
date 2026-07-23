# db-adapter

gRPC service that exposes EasyTrade's database behind a stable API. The storage
backend is pluggable: the gRPC layer depends only on interfaces, so a new
database is added by creating one new package.

## Layout

```
models/               domain types + repository INTERFACES (storage-agnostic)
repository/
  repository.go       CompositeRepository – bundles all 8 repositories
  registry.go         Provider interface + Register()/Open()
  constants.go        canonical table & column names
  mssql/              concrete backend
  postgres/           concrete backend
server/               gRPC handlers – depend on models.*Repository only
config/               env config; DB_TYPE selects the backend
db/                   connect-with-retry helper
main.go               blank-imports each backend, then calls repository.Open()
```

The schema + seed SQL for each backend lives outside this service, in
`src/db/<DB_TYPE>/` (e.g. `src/db/mssql/`, `src/db/postgres/`). `compose.dev.yaml`
builds the `db` container from `src/db/${DB_TYPE}`.

## Add a new database

`mssql/` and `postgres/` are complete backends; copy the one closest to your target
as a template. The registered name, the `src/db/<name>` SQL dir, and `DB_TYPE` must
all be the same string.

1. **Implement the backend package** `repository/<name>/`. Mirror the template:
   one file per aggregate (a DB model struct, `toX`/`fromX` mappers, and the
   repository with `var _ models.XRepository = (*XRepository)(nil)`), a
   `CompositeRepository` (`<Name>Repository` in `repository.go`), and a `Provider`
   whose `init()` registers itself:
   ```go
   func (Provider) Connect(cfg config.DatabaseConfig) (repository.CompositeRepository, error) { ... }
   func init() { repository.Register("<name>", Provider{}) }
   ```
   Use the name constants from `repository/constants.go` in queries — never
   hard-code identifiers (add any missing column there).

2. **Blank-import the package** in `main.go` so its `init()` runs:
   ```go
   _ "github.com/dynatrace/easytrade/dbadapter/repository/<name>"
   ```

3. **Add the DB image + SQL** under `src/db/<name>/` (Dockerfile + schema/seed
   scripts). Keep the table and column names identical to `constants.go`.

4. **Run it:** set `DB_TYPE=<name>` and `DB_URL=...` (in `.env` or the environment),
   then `./db-adapter` — or `./runDev.sh start` for the full compose stack.

`go build ./...` must pass — the `var _` assertions catch any unimplemented method.

### Portability notes

- **Quote identifiers in raw SQL fragments yourself.** GORM quotes identifiers it
  derives from the model (table name, struct columns), but the `Where`/`Order`/
  `Joins`/`Select`/`Group` strings we build from the `Col*`/`Table*` constants are
  passed through verbatim. If your DB is case-sensitive (Postgres) or otherwise
  folds unquoted identifiers, quote them — see `postgres/helpers.go` (`q`, `qcol`).
- **Match the identifier casing / collation.** MSSQL is case-insensitive; Postgres
  is not. The `constants.go` names are PascalCase, so the Postgres DDL quotes every
  identifier and its enum `CHECK`s use `lower(...)` to accept mixed-case input the
  way MSSQL did.

## Makefile

```bash
make proto   # regenerate gRPC stubs from src/proto/*.proto → proto/*.pb.go
make build   # go build ./...
make test    # go test ./...
make tidy    # go mod tidy
```

Proto sources live in `src/proto/` (shared across services). Generated Go files are
written to `src/db-adapter/proto/` (`*pb.go` / `*grpc.pb.go`). Requires `protoc` and
`protoc-gen-go`/`protoc-gen-go-grpc` on `PATH`.

## Config

| Env var | Default | Purpose |
|---|---|---|
| `DB_TYPE` | `mssql` | Selects the registered backend |
| `DB_URL` | – | Connection string |
| `DB_CONNECT_TIMEOUT` | `5m` | Total connect-retry window |
| `DB_RETRY_INTERVAL` | `10s` | Delay between attempts |
| `GRPC_PORT` | `50051` | gRPC listen port |
