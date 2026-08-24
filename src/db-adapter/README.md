# db-adapter

gRPC service that exposes EasyTrade's database behind a stable API. The storage
backend is pluggable: the gRPC layer depends only on interfaces, so a new
SQL dialect is added without touching the server or interface layers.

## Layout

```
repository/
  interfaces.go       DBBackend composite interface + 8 repository interfaces
  constants.go        canonical table & column names
  errors.go           sentinel errors (ErrNotFound, …)
  sql/                single dialect-agnostic GORM backend (MSSQL + Postgres)
server/               gRPC handlers and register.go (wires handlers logic)
config/               env config; DB_TYPE selects the backend
db/                   connect-with-retry helper
backend.go            (in package main) exports newDBBackend which switches on DB_TYPE
main.go               calls newDBBackend and server.Register to start the gRPC server
```

The schema + seed SQL for each backend lives outside this service, in
`src/db/<DB_TYPE>/` (e.g. `src/db/mssql/`, `src/db/postgres/`). `compose.dev.yaml`
builds the `db` container from `src/db/${DB_TYPE}`.

## Add a new backend

The `newDBBackend` function in `backend.go` is the extension point. The server layer never needs to change.

### Option A — new SQL dialect (GORM-supported)

`repository/sql` already handles any GORM dialector. Add a constructor in
`repository/sql/backend.go`:

```go
func NewMySQLBackend(cfg config.DatabaseConfig) (repository.DBBackend, error) {
    return newBackend(cfg, mysql.Open(cfg.Url))
}
```

Then wire it up in `backend.go` (next to `main.go`):

```go
func newDBBackend(cfg config.DatabaseConfig) (repository.DBBackend, error) {
    switch cfg.Type {
    // ...
    case "mysql":
        return sqlrepo.NewMySQLBackend(cfg)
    // ...
    }
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

Create a new package `repository/<name>/` that exposes a constructor returning a `repository.DBBackend` (which implements all 8 interfaces from `repository/interfaces.go`).

```go
// repository/<name>/backend.go
package name

import "github.com/dynatrace/easytrade/dbadapter/repository"

func NewBackend(cfg config.DatabaseConfig) (repository.DBBackend, error) {
    // open connection, return a DBBackend implementation
}
```

Then add it to the switch statement in `backend.go`:

```go
    case "<name>":
        return customrepo.NewBackend(cfg)
```

Use the table/column name constants from `repository/constants.go` — never
hard-code identifiers. `go build ./...` must pass; the `var _ repository.XRepository`
assertions in each file catch any unimplemented method at compile time.

### Both options: add DB schema + seed

Add a `src/db/<name>/` directory (Dockerfile + schema/seed scripts) keeping table
and column names identical to `repository/constants.go`. Set `DB_TYPE=<name>` and
`DB_URL=...` to run.

## Common commands

```bash
sh generate-proto.sh   # regenerate gRPC stubs from src/proto/*.proto → proto/*.pb.go
go build ./...
go test ./...
go run .
go mod tidy
```

`generate-proto.sh` compiles all `../proto/*.proto` files and writes the generated Go stubs into `proto/`; requires `protoc`, `protoc-gen-go`, and `protoc-gen-go-grpc` on `PATH`. Re-run it whenever the shared proto files change.

## Config

| Env var | Default | Purpose |
|---|---|---|
| `DB_TYPE` | `mssql` | Selects the registered backend |
| `DB_URL` | – | Connection string |
| `DB_CONNECT_TIMEOUT` | `5m` | Total connect-retry window |
| `DB_RETRY_INTERVAL` | `10s` | Delay between attempts |
| `GRPC_PORT` | `50051` | gRPC listen port |
