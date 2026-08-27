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
docker build -t IMAGE_NAME .
docker run -d --name SERVICE_NAME IMAGE_NAME
```

