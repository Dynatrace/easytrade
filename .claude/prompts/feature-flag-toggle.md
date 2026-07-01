---
description: Toggle EasyTrade problem patterns (DbNotResponding, ErgoAggregatorSlowdown, FactoryCrisis, HighCpuUsage) via the feature-flag-service API
---

# Toggle Problem Pattern

Use this prompt to enable or disable one of EasyTrade's four problem patterns.

## Problem Pattern IDs

List current flags and their IDs:
```bash
curl -s "http://localhost/feature-flag-service/v1/flags/" | jq .
```

Swagger UI: `http://localhost/feature-flag-service/swagger-ui/index.html`

## Enable a pattern

```bash
curl -X PUT "http://localhost/feature-flag-service/v1/flags/{flagId}/" \
  -H "accept: application/json" \
  -d '{"enabled": true}'
```

## Disable a pattern

```bash
curl -X PUT "http://localhost/feature-flag-service/v1/flags/{flagId}/" \
  -H "accept: application/json" \
  -d '{"enabled": false}'
```

## Expected behavior by pattern

| Pattern | Effect | Dynatrace problem trigger |
|---|---|---|
| `DbNotResponding` | No new trades — DB throws errors | ~20 min run |
| `ErgoAggregatorSlowdown` | 2 aggregators slow → stop sending; 40% traffic drop | 15–20 min |
| `FactoryCrisis` | No new cards → third-party blocks credit card orders | On next order attempt |
| `HighCpuUsage` | Broker-service slowdown + high CPU; K8s adds CPU limit | Immediately |

## K8s cron jobs

Pre-built cron jobs that enable patterns once daily: `./kubernetes-manifests/problem-patterns/`
