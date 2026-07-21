# user-service

Go service for user authentication and account management. Runs behind the nginx reverse proxy.

**Stack:** Go, Gin. All data access goes through the `db-adapter` service over gRPC, via the
generated `proto.AccountServiceClient` (contract in `../proto/account_service.proto`; regenerate
with `make -C ../proto generate`).

## Build

```bash
go build .
go test ./...
```

## Environment variables

| Name | Description |
| ---- | ----------- |
| `DB_ADAPTER_ADDRESS` | Ready-to-dial address of the `db-adapter` gRPC service (e.g. `db-adapter:8080`) |
