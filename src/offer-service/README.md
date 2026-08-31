# easyTradeOfferService

A Node.js/Express service that acts as the public-facing API for product and package information, and for new user registration. It primarily exists to serve the aggregator service, acting as the gateway between it and the internal backend services (db-adapter for products/packages, user-service for signup).

## Technologies used

- Node.js + TypeScript
- Express 5
- gRPC (via `@grpc/grpc-js`) for db-adapter communication
- OpenFeature (feature flag evaluation)
- Winston (structured logging)

## Local development

### Build and run in Docker

```bash
docker build -t offer-service .
docker run -p 8087:8080 offer-service
```

### Build TypeScript locally

```bash
npm install
npm run generate:proto   # generates gRPC client code from proto files
npm run build            # compiles to ./dist
npm start                # runs ./dist/app.js
```

## Proto code generation

The service uses gRPC to communicate with the db-adapter service. Proto files live in `../proto/` and are compiled by:

```bash
npm run generate:proto
```

This generates TypeScript client classes in `src/proto/` (which are gitignored and regenerated on each build).

## Environment variables

| Variable                       | Default                    | Description                                  |
| ------------------------------ | -------------------------- | -------------------------------------------- |
| `DB_ADAPTER_ADDRESS`           | `localhost:50051`          | Host and port of the db-adapter gRPC service |
| `USER_SERVICE_ADDRESS`         | `http://localhost:8080`    | Full URL of user-service                     |
| `FEATURE_FLAG_SERVICE_ADDRESS` | `http://localhost:8080`    | Full URL of feature-flag-service             |

See [`offer-service.http`](./offer-service.http) for ready-to-run example requests covering all endpoints.
