# reverse-proxy

Nginx reverse proxy. It is the single entry point to EasyTrade: it serves the React frontend
and routes every API call to the right service, both under Docker Compose and on Kubernetes.

## Technologies used

- Docker
- Nginx

## Routing

Each location strips its own prefix before proxying and forwards it again as
`X-Forwarded-Prefix`. The upstream for each route is read from an environment variable at
container start (`envsubst` renders `nginx.conf` from a template).

| Location | Environment variable | Default upstream |
| --- | --- | --- |
| `/broker-service` | `BROKER_SERVICE_URL` | `http://broker-service:8080` |
| `/user-service` | `USER_SERVICE_URL` | `http://user-service:8080` |
| `/pricing-service` | `PRICING_SERVICE_URL` | `http://pricing-service:8080` |
| `/offer-service` | `OFFER_SERVICE_URL` | `http://offer-service:8080` |
| `/credit-card-order-service` | `CREDIT_CARD_ORDER_SERVICE_URL` | `http://credit-card-order-service:8080` |
| `/background-service` | `BACKGROUND_SERVICE_URL` | `http://background-service:8080` |
| `/feature-flag-service` | `FEATURE_FLAG_SERVICE_URL` | `http://feature-flag-service:8080` |
| `/` | `FRONTEND_URL` | `http://frontend:3000/` |

`FRONTEND_REVERSE_PROXY_PORT` sets the port nginx listens on. It defaults to `80`, which is
what Docker Compose uses; the Helm chart overrides it to `8080`.

All defaults live in the `ENV` lines of the `Dockerfile`, so Compose passes no environment
at all and relies on them.

## Local build instructions

```bash
make build services=reverse-proxy      # build the image from local source
make redeploy services=reverse-proxy   # rebuild and recreate it in the running stack
```

Run `make help` for every target.
