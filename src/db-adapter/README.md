# db-adapter

gRPC service that exposes EasyTrade's database behind a stable API. The storage
backend is pluggable: the gRPC layer depends only on interfaces, so a new
SQL dialect is added without touching the server or interface layers.

## Layout

```
repository/
  interfaces.go       all 8 repository interfaces (proto types in, proto types out)
  repository.go       CompositeRepository – bundles all 8 repositories
  registry.go         Provider interface + Register()/Open()
  constants.go        canonical table & column names
  errors.go           sentinel errors (ErrNotFound, …)
  sql/                single dialect-agnostic GORM backend (MSSQL + Postgres)
server/               gRPC handlers – orchestrate fetch/mutate/save; depend on interfaces only
config/               env config; DB_TYPE selects the backend
db/                   connect-with-retry helper
main.go               blank-imports repository/sql, then calls repository.Open()
```

The schema + seed SQL for each backend lives outside this service, in
`src/db/<DB_TYPE>/` (e.g. `src/db/mssql/`, `src/db/postgres/`). `compose.dev.yaml`
builds the `db` container from `src/db/${DB_TYPE}`.

## Add a new backend

The registry in `repository/registry.go` is the only extension point. A backend is
any package that implements `repository.Provider` and calls `repository.Register` in
its `init()`. The server layer never needs to change.

### Option A — new SQL dialect (GORM-supported)

`repository/sql` already handles any GORM dialector. Add a branch in
`repository/sql/provider.go` and register the new name:

```go
// provider.go – Connect()
case "mysql":
    dialector = mysql.Open(cfg.Url)

// provider.go – init()
func init() {
    repository.Register("mssql", Provider{})
    repository.Register("postgres", Provider{})
    repository.Register("mysql", Provider{})
}
```

> **MSSQL/Postgres-specific notes in `repository/sql`:**
> - Identifier quoting — `q()`/`qcol()` in `helpers.go` wrap PascalCase names in
>   double-quotes (works on both dialects; Postgres folds unquoted to lower-case).
> - UUID round-trip on MSSQL — the provider injects `guid conversion=true` into the
>   DSN so `go-mssqldb` reorders mixed-endian bytes before handing off to `*uuid.UUID`.
> - DB-generated PKs — `gorm:"primaryKey;default:(-)"`; a nil `*uuid.UUID` makes GORM
>   omit the column so the DB `DEFAULT` fires and the value is read back via
>   `OUTPUT`/`RETURNING`.

### Option B — entirely new database (non-SQL)

Create a new package `repository/<name>/` that implements `repository.Provider` and
all 8 interfaces from `repository/interfaces.go`, then register it:

```go
// repository/<name>/provider.go
type Provider struct{}

func (Provider) Connect(cfg config.DatabaseConfig) (repository.CompositeRepository, error) {
    // open connection, return a CompositeRepository
}

func init() { repository.Register("<name>", Provider{}) }
```

Blank-import the package in `main.go` so its `init()` runs:

```go
_ "github.com/dynatrace/easytrade/dbadapter/repository/<name>"
```

Use the table/column name constants from `repository/constants.go` — never
hard-code identifiers. `go build ./...` must pass; the `var _ repository.XRepository`
assertions in each file catch any unimplemented method at compile time.

### Both options: add DB schema + seed

Add a `src/db/<name>/` directory (Dockerfile + schema/seed scripts) keeping table
and column names identical to `repository/constants.go`. Set `DB_TYPE=<name>` and
`DB_URL=...` to run.

## Makefile

```bash
make proto   # regenerate gRPC stubs from src/proto/*.proto → proto/*.pb.go
make build   # go build ./...
make test    # go test ./...
make run    # go run .
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
