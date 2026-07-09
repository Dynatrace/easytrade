---
name: service-add
description: >
  Checklist for adding a new microservice to EasyTrade: Dockerfile, compose.dev.yaml entry,
  nginx proxy rule, DB migration script, and Helm values. Trigger phrases: "add a new service",
  "create new microservice", "new EasyTrade service", "add service to easytrade".
model: sonnet
tools: Read, Write, Edit, Bash, Grep, Glob
---

You are adding a new microservice to EasyTrade. Work through each step below in order —
do not skip steps, since partial additions break the proxy routing or DB init.

## Step 1 — Dockerfile

Create `src/<service-name>/Dockerfile`. Use multi-stage build. Pick the base image for the stack:

- **Java**: `FROM gradle:8-jdk21 AS build` → `FROM eclipse-temurin:21-jre`
- **Go**: `FROM golang:1.26.3-alpine3.23@sha256:<digest> AS build` → `FROM alpine:3.23`
- **Node.js**: `FROM node:22-alpine AS build` → `FROM node:22-alpine`
- **.NET**: `FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build` → `FROM mcr.microsoft.com/dotnet/aspnet:8.0`

Expose the service port. Default internal port used by other EasyTrade services: `8080`.

## Step 2 — compose.dev.yaml entry

Add a service block. Copy the anchor pattern from an existing service:

```yaml
  <service-name>:
    <<: *default-service
    build: src/<service-name>
    ports:
      - "<host-port>:8080"
    environment:
      <<: *feature-flag-service-env   # if service uses feature flags
      # Stack-specific connection string (pick one):
      JAVA_CONNECTION_STRING: *java-connection-string
      DOTNET_CONNECTION_STRING: *dotnet-connection-string
      GO_CONNECTION_STRING: *go-connection-string
    depends_on:
      - db
      - feature-flag-service          # if applicable
```

Do NOT modify `compose.yaml` (registry images) — only `compose.dev.yaml`.

## Step 3 — nginx proxy rule

Add a location block to `src/frontendreverseproxy/nginx.conf`:

```nginx
location /<service-endpoint> {
  rewrite /<service-endpoint>/(.*) /$1 break;
  proxy_pass ${<SERVICE_NAME>_URL};
  proxy_redirect off;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Host $server_name;
  proxy_set_header X-Forwarder-Proto $scheme;
  proxy_set_header X-Forwarded-Prefix /<service-endpoint>;
}
```

Add the corresponding env var to the `frontendreverseproxy` service in `compose.dev.yaml`:
```yaml
<SERVICE_NAME>_URL: http://<service-name>:8080
```

## Step 4 — DB migration script (if service needs new tables)

Add a SQL file to `src/db/sql-scripts/`:

```sql
-- sql-<tablename>.sql
USE TradeManagement;
CREATE TABLE <TableName> (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  -- columns
);
```

Follow the naming convention of existing scripts (`sql-instruments.sql`, `sql-accounts.sql`, etc.). The DB `entrypoint.sh` runs all scripts in the `sql-scripts/` directory on first start.

## Step 5 — Verify

```bash
# Rebuild new service image
./runDev.sh build <service-name>

# Start full stack
./runDev.sh start-all

# Check service is up
docker compose -f compose.dev.yaml ps <service-name>

# Smoke test the endpoint
curl -sf http://localhost/<service-endpoint>/v1/health | jq .
```

## Step 6 — Helm values (for K8s deploy)

Add the service to `helm/easytrade/values.yaml` following the pattern of existing services. Each service needs: `image`, `replicaCount`, `env`, and `service.port`.
