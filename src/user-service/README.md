# user-service

Go service for user authentication and account management. Runs behind the nginx reverse proxy.

**Stack:** Go, Gin. All data access goes through the `db-adapter` service (REST) via the
`DbAdapter` interface — the service no longer connects to SQL Server or the `manager` service
directly.

## Build

```bash
go build .
go test ./...
```

## Environment variables

| Name | Description |
| ---- | ----------- |
| `DB_ADAPTER_ADDRESS` | Address of the `db-adapter` service in `protocol\|host\|port` format (e.g. `http\|db-adapter\|8080`) |
