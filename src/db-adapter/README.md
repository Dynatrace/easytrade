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
  mssql/              a concrete backend (implement a sibling package to add one)
server/               gRPC handlers – depend on models.*Repository only
config/               env config; DB_TYPE selects the backend
db/                   connect-with-retry helper
main.go               blank-imports each backend, then calls repository.Open()
```

## Add a new database (e.g. postgresql)

Everything goes in a new `repository/postgresql/` package. Use `repository/mssql/`
as a template.

1. **Implement the 8 repository interfaces** defined in `models/` (`AccountRepository`
   in `models/account.go`, `BalanceRepository` in `models/balance.go`, etc.).
   One file per aggregate: a DB model struct, `toX`/`fromX` mappers to the domain
   type, and the repository with `var _ models.XRepository = (*XRepository)(nil)`.
   Use the name constants from `repository/constants.go` in queries (add any
   missing column there, don't hard-code strings).

2. **Implement `CompositeRepository`** (`repository/repository.go`) — a struct with
   the 8 accessors. See `mssql/repository.go`.

3. **Implement and register `Provider`** (`repository/registry.go`):
   ```go
   func (Provider) Connect(dbConfig config.DatabaseConfig) (repository.CompositeRepository, error) { ... }
   func init() { repository.Register("postgresql", Provider{}) }
   ```

4. **Blank-import the package** in `main.go` so its `init()` runs:
   ```go
   _ "github.com/dynatrace/easytrade/dbadapter/repository/postgresql"
   ```

5. **Run it:** `DB_TYPE=postgresql DB_URL=... ./db-adapter`

`go build ./...` must pass — the `var _` assertions catch any unimplemented method.

## Config

| Env var | Default | Purpose |
|---|---|---|
| `DB_TYPE` | `mssql` | Selects the registered backend |
| `DB_URL` | – | Connection string |
| `DB_CONNECT_TIMEOUT` | `5m` | Total connect-retry window |
| `DB_RETRY_INTERVAL` | `10s` | Delay between attempts |
| `GRPC_PORT` | `50051` | gRPC listen port |
