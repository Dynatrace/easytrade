# user-service

A Go service that implements user authentication and account management for the EasyTrade platform. It is intended to be run as a Docker container behind an nginx reverse proxy.

## Technologies used

- Docker
- Go, Gin, GORM (SQL Server driver)

## Local build instructions

```bash
go mod tidy
go build .
go test ./...
```

```bash
docker build -t IMAGE_NAME .
docker run -d --name SERVICE_NAME IMAGE_NAME
```

## Endpoints

| Method | Route                          |
| ------ | ------------------------------- |
| POST   | `/api/auth/login`               |
| POST   | `/api/auth/signup`               |
| GET    | `/api/accounts/:id`              |
| GET    | `/api/accounts/presets?limit=`   |
| GET    | `/api/version`                   |

Account read/list operations proxy to the `manager` service's Accounts API (`MANAGER_HOSTANDPORT`).

## Environment variables

| Name                  | Description                                              |
| --------------------- | ---------------------------------------------------------- |
| `GO_CONNECTION_STRING` | GORM/SQL Server connection string for the shared `TradeManagement` DB |
| `MANAGER_HOSTANDPORT`  | `host:port` of the `manager` service, used for account proxy calls |
| `PROXY_PREFIX`         | Path prefix this service is reverse-proxied under (nginx)  |
