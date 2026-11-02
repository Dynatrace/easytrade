---
description: Start EasyTrade locally with Docker Compose and verify the stack is healthy with smoke tests against the REST APIs
---

# Local Dev + Smoke Test

## Prerequisites

- Docker >= v20.10.13 with Compose plugin (`docker compose version`)
- Port 80 free on localhost

## Start the stack

**Minimal** (proxy + background-service + db only — fastest startup):
```bash
make start services="db frontendreverseproxy background-service"
```

**Full stack** (all services):
```bash
make start
```

**Rebuild a service image before starting** (after code changes):
```bash
make redeploy services=<service-name>
```

Wait ~30 s for services to initialise. Check container health:
```bash
docker compose -f compose.dev.yaml ps
```

## Smoke tests — REST API

Run these curl checks against `http://localhost`. All should return HTTP 200 and valid JSON.

### 1. Feature flag service health
```bash
curl -sf http://localhost/feature-flag-service/v1/flags/ | jq 'length'
# expected: number > 0 (four flags defined)
```

### 2. User service — list preset accounts
```bash
curl -sf http://localhost/user-service/api/accounts/presets | jq 'length'
# expected: number > 0
```

### 3. Instrument list
```bash
curl -sf http://localhost/broker-service/v1/instrument | jq 'length'
# expected: number > 0
```

### 4. Login with known user
```bash
curl -sf -X POST http://localhost/user-service/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"james_norton","password":"pass_james_123"}' | jq '.token'
# expected: a non-null JWT string
```

### 5. Pricing service — current prices
```bash
curl -sf http://localhost/pricing-service/v1/prices/ | jq 'length'
# expected: number > 0
```

## Run frontend unit tests

```bash
cd src/frontend
npm install
npm test -- --run
```

Expected: all tests pass (no snapshot failures, no assertion errors).

## Stop the stack

```bash
make stop
```

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Port 80 already in use | Another nginx/proxy running | `sudo lsof -i :80` then kill or reconfigure |
| DB connection errors | `db` container not ready | Wait ~15 s, or `docker compose -f compose.dev.yaml logs db` |
| Service returns 502 | Service crashed on startup | `docker compose -f compose.dev.yaml logs <service-name>` |
| Stale image | Code changed but image not rebuilt | `make redeploy services=<service-name>` |
