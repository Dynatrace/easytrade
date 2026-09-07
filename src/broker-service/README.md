# EasyTradeBrokerService

This service manages account balances and processes trades. It leverages gRPC to communicate with the `db-adapter` service for data persistence.

## Technologies used

- .NET 8 (ASP.NET Core)
- Docker
- gRPC

## Local build instructions

### Standard .NET Development

```bash
cd BrokerService
dotnet build
dotnet test test/BrokerService.test.csproj
dotnet run --project src/BrokerService.csproj
```
### Docker Build
To build via Docker, ensure that you run the `docker build` command from the parent `src/` directory so Docker has context to the shared `proto/` folder:

```bash
cd .. 
docker build -t easytrade-broker-service -f broker-service/Dockerfile .
```

## Problem patterns

### Db not responding

When enabled, no new records will be added to Trade table, as they will fail. Problem pattern can be enabled using the api provided with the feature flag service.

### High CPU usage

When enabled every request will be delayed by **HIGH_CPU_USAGE_REQUEST_DELAY_MS** or default value if env var not set. During this time Collatz conjecture will be calculated for random numbers on to add a significant load to cpu. It will be run on **HIGH_CPU_USAGE_CONCURRENCY** tasks.

### Credit card validation

When enabled, the `cardNumber` field from deposit and withdraw request bodies is validated against the mainframe before the operation is processed. If the mainframe deems the card invalid, the request is rejected with a `400` response.

If the mainframe is unreachable, returns an error, or `MAINFRAME_SERVICE_ADDRESS` is not configured, the middleware fails open and the request proceeds normally. This means `MAINFRAME_SERVICE_ADDRESS` is only required when the flag is enabled.

The problem patterns are toggled through the feature flag service. The responses from the service are cached for **FEATURE_FLAG_CACHE_DURATION_S** or the default value if the env var is not set.

| Environment variable | Description |
| -------------------- | ----------- |
| `MAINFRAME_SERVICE_ADDRESS` | Base URL of the mainframe service (e.g. `https://<mainframe-host>:<port>`). Only required when the flag is enabled. |
