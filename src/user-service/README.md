# user-service

Go service for user authentication and account management. Runs behind the nginx reverse proxy.

**Stack:** Go, Gin. All data access goes through the `db-adapter` service over gRPC, via the
generated `proto.AccountServiceClient` (contracts in `../proto/account_service.proto` and `../proto/balance_service.proto`; stubs are generated during `docker build` and written to `proto/`).

## Build

```bash
go build .
go test ./...
```

## Environment variables

| Name | Description |
| ---- | ----------- |
| `DB_ADAPTER_ADDRESS` | Ready-to-dial address of the `db-adapter` gRPC service (e.g. `db-adapter:8080`) |

## Health endpoints

The service exposes `/livez` (liveness) and `/readyz` (readiness)
