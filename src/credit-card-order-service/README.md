# easyTradeCreditCardOrderService

A java service that lets the user order/remove a credit card for their account. All the manufacturing and delivery will be handled by an unmonitored third party service. The card information is stored in the database.

## Technologies used

- Java 21
- Docker
- gRPC (db-adapter)

## Environment variables

| Variable                         | Description                                        |
| -------------------------------- | -------------------------------------------------- |
| `DB_ADAPTER_ADDRESS`             | Address of the db-adapter gRPC service (`host:port`) |
| `THIRD_PARTY_SERVICE_ADDRESS`    | URL of the third-party manufacturer service        |
| `FEATURE_FLAG_SERVICE_ADDRESS`   | URL of the feature-flag-service                    |
| `WORK_DELAY`                     | Initial delay (ms) before WorkScheduler starts     |
| `WORK_RATE`                      | Base rate (ms) for WorkScheduler polling           |

## Local build instructions

```bash
make build services=credit-card-order-service      # build the image from local source
make redeploy services=credit-card-order-service   # rebuild and recreate it in the running stack
```

`make` handles the build context and the shared `src/proto/` definitions for you. Run
`make help` for every target.

To build and test without Docker, run `./gradlew build` in this directory.

