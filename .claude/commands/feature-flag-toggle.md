---
description: Enable or disable an EasyTrade problem pattern via the feature-flag-service API
argument-hint: [pattern-name] [enable|disable]
---

Toggle the EasyTrade problem pattern given in $ARGUMENTS (a pattern name, and optionally
"enable" or "disable" — default to enabling if the state isn't specified).

1. List current flags and find the flag ID whose name matches the requested pattern
   (`DbNotResponding`, `ErgoAggregatorSlowdown`, `FactoryCrisis`, `HighCpuUsage`):
   ```bash
   curl -s "http://localhost/feature-flag-service/v1/flags/" | jq .
   ```
   Swagger UI: `http://localhost/feature-flag-service/swagger-ui/index.html`

2. PUT the requested state for that flag ID:
   ```bash
   curl -X PUT "http://localhost/feature-flag-service/v1/flags/{flagId}/" \
     -H "accept: application/json" \
     -d '{"enabled": true}'   # or false to disable
   ```

3. Confirm the change by re-fetching the flag list and checking the `enabled` field for the target flag.

4. Report the expected effect and Dynatrace trigger lag:

   | Pattern | Effect | Dynatrace problem trigger |
   |---|---|---|
   | `DbNotResponding` | No new trades — DB throws errors | ~20 min run |
   | `ErgoAggregatorSlowdown` | 2 aggregators slow → stop sending; 40% traffic drop | 15–20 min |
   | `FactoryCrisis` | No new cards → third-party blocks credit card orders | On next order attempt |
   | `HighCpuUsage` | Broker-service slowdown + high CPU; K8s adds CPU limit | Immediately |

Pre-built K8s cron jobs that enable patterns once daily live in `./kubernetes-manifests/problem-patterns/`.
