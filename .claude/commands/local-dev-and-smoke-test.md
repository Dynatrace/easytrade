---
description: Start EasyTrade locally with Docker Compose and verify the stack is healthy with smoke tests against the REST APIs
argument-hint: "[start|start-all] (default: start-all)"
---

Start the local EasyTrade stack and confirm it's healthy end to end.

## Prerequisites
Confirm Docker >= v20.10.13 with the Compose plugin is available (`docker compose version`) and port 80 is free on localhost.

## 1. Start the stack
Use $ARGUMENTS to decide scope — `start` for the minimal set (proxy + contentcreator + engine),
`start-all` for all 19 services (default):
```bash
./runDev.sh start        # minimal
./runDev.sh start-all    # full stack
```
If code changed since the last build, rebuild first:
```bash
./runDev.sh build <service-name>
```
Wait ~30s for services to initialize, then confirm container health:
```bash
docker compose -f compose.dev.yaml ps
```

## 2. Run smoke tests
Run each curl check against `http://localhost` and confirm HTTP 200 with valid JSON:

1. Feature flag service health — expect a number > 0 (four flags defined):
   ```bash
   curl -sf http://localhost/feature-flag-service/v1/flags/ | jq 'length'
   ```
2. Account service — list users — expect a quoted name string:
   ```bash
   curl -sf http://localhost/accountservice/v1/accounts/ | jq '.[0].firstName'
   ```
3. Instrument list — expect a number > 0:
   ```bash
   curl -sf http://localhost/engine/v2/instruments/ | jq 'length'
   ```
4. Login with a known user — expect a non-null JWT string:
   ```bash
   curl -sf -X POST http://localhost/loginservice/v1/login/ \
     -H "Content-Type: application/json" \
     -d '{"username":"james_norton","password":"pass_james_123"}' | jq '.token'
   ```
5. Pricing service — current prices — expect a number > 0:
   ```bash
   curl -sf http://localhost/pricing-service/v1/prices/ | jq 'length'
   ```

## 3. Run frontend unit tests
```bash
cd src/frontend
npm install
npm test -- --run
```
Expect all tests to pass (no snapshot failures, no assertion errors).

## 4. Report results
Show the pass/fail status of each smoke check and the test run output. If anything fails,
diagnose using the table below before reporting the task complete.

| Symptom | Likely cause | Fix |
|---|---|---|
| Port 80 already in use | Another nginx/proxy running | `sudo lsof -i :80` then kill or reconfigure |
| DB connection errors | `db` container not ready | Wait ~15s, or `docker compose -f compose.dev.yaml logs db` |
| Service returns 502 | Service crashed on startup | `docker compose -f compose.dev.yaml logs <service-name>` |
| Stale image | Code changed but image not rebuilt | `./runDev.sh build <service-name>` |

## 5. Stop the stack (only if requested)
```bash
./runDev.sh stop
```
