# user-service

A Go service that merges `loginservice` (C#/.NET) and `accountservice` (Java/Spring Boot) into a
single unified service, to reduce resource usage and eliminate redundancy between two services
that served the same domain.

**Status: scaffold only.** Handlers are stubs — see `CHANGES.md` for the task this scaffold was
built from. No real business logic is implemented yet.

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

Ported 1:1 from the two source services, **excluding `logout`** (it performed no real session
invalidation in `loginservice` and was intentionally dropped).

### From `loginservice`

| Method | Route                                       | Origin                        |
| ------ | -------------------------------------------- | ------------------------------ |
| POST   | `/api/Login`                                 | `LoginController`              |
| POST   | `/api/Signup`                                | `SignupController`             |
| GET    | `/api/Accounts/GetAccountById/{id}`          | `AccountsController`           |
| GET    | `/api/Accounts/GetAccountByUsername/{username}` | `AccountsController`        |
| POST   | `/api/Accounts/CreateNewAccount`             | `AccountsController`           |

### From `accountservice`

| Method | Route                          | Origin                 |
| ------ | ------------------------------- | ----------------------- |
| GET    | `/api/account/{id}`             | `AccountController` (v1) |
| PUT    | `/api/account/update`           | `AccountController` (v1) |
| GET    | `/api/accounts/{id}`            | `AccountControllerV2` (v2) |
| PUT    | `/api/accounts/`                | `AccountControllerV2` (v2) |
| GET    | `/api/accounts/presets?limit=`  | `AccountControllerV2` (v2) |

Account read/update/list operations proxy to the `manager` service's Accounts API
(`MANAGER_HOSTANDPORT`), mirroring `accountservice`'s existing behavior.

### Shared

| Method | Route          |
| ------ | -------------- |
| GET    | `/api/version` |

## Environment variables

| Name                  | Description                                              |
| --------------------- | ---------------------------------------------------------- |
| `GO_CONNECTION_STRING` | GORM/SQL Server connection string for the shared `TradeManagement` DB |
| `MANAGER_HOSTANDPORT`  | `host:port` of the `manager` service, used for account proxy calls |
| `PROXY_PREFIX`         | Path prefix this service is reverse-proxied under (nginx)  |
