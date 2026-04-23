# easyTradeOfferService

A Node.js/Express service that acts as the public-facing API for product and package information, and for new user registration. It primarily exists to serve the aggregator service, acting as the gateway between it and the internal backend services (manager, loginservice).

## Technologies used

- Node.js + TypeScript
- Express 5
- OpenFeature (feature flag evaluation)
- Winston (structured logging)

## Local development

### Build and run in Docker

```bash
docker build -t offerservice .
docker run -p 8087:8080 offerservice
```

### Build TypeScript locally

```bash
npm install
npm run build   # compiles to ./dist
npm start       # runs ./dist/app.js
```

## Environment variables

| Variable                         | Default     | Description                                        |
| -------------------------------- | ----------- | -------------------------------------------------- |
| `APP_PORT`                       | `8080`      | Port the HTTP server listens on                    |
| `MANAGER_PROTOCOL`               | `http`      | Protocol for manager service                       |
| `MANAGER_BASE_URL`               | `localhost` | Hostname for manager service                       |
| `MANAGER_PORT`                   | `8081`      | Port for manager service                           |
| `LOGIN_SERVICE_PROTOCOL`         | `http`      | Protocol for loginservice                          |
| `LOGIN_SERVICE_BASE_URL`         | `localhost` | Hostname for loginservice                          |
| `LOGIN_SERVICE_PORT`             | `8081`      | Port for loginservice                              |
| `FEATURE_FLAG_SERVICE_PROTOCOL`  | `http`      | Protocol for feature flag service                  |
| `FEATURE_FLAG_SERVICE_BASE_URL`  | `localhost` | Hostname for feature flag service                  |
| `FEATURE_FLAG_SERVICE_PORT`      | `80`        | Port for feature flag service                      |

## Endpoints

See [`requests.http`](./requests.http) for ready-to-run example requests covering all endpoints, including JSON and XML response variants for offers, signup, and version.

### Summary

| Method | Path                        | Description                                          |
| ------ | --------------------------- | ---------------------------------------------------- |
| GET    | `/api/offers/:platform`     | Returns packages and products available for a given aggregator platform. Accepts optional query filters. Responds with JSON by default; set `Accept: application/xml` for XML. |
| POST   | `/api/signup`               | Creates a new user account via loginservice. Proxies the request body directly. |
| GET    | `/version`                  | Returns the service version as plain text or JSON.   |

### Offer filters

`GET /api/offers/:platform` accepts two optional query parameters:

- `maxYearlyFeeFilter` — numeric; only packages with a yearly price at or below this value are returned
- `productFilter` — JSON-encoded array of product name strings; only products whose names are in the list are returned

## Problem pattern

Offerservice supports one problem pattern: `ergo_aggregator_slowdown`.

When the pattern is enabled, two of the five aggregator platforms are randomly selected and all offer requests from those platforms receive an artificial delay of 2 seconds. The selection happens once when the pattern is activated and stays fixed for the duration of that activation. When the pattern is disabled and re-enabled, a new pair of platforms is selected.

The five platforms are:

- `dynatestsieger.at`
- `tradeCom.co.uk`
- `CryptoTrading.com`
- `CheapTrading.mi`
- `Stratton-oakmount.com`

The pattern is toggled via the feature flag service. See the [feature flag service README](../feature-flag-service/README.md) for details.
