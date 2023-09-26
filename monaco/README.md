# Easytrade Monaco configuration

## Setup

- Install the Monaco ([docs](https://www.dynatrace.com/support/help/manage/configuration-as-code/monaco/installation))
- Prepare the API token with permissions
  - `settings.read`
  - `settings.write`
  - `DataExport`
  - `ReadConfig`
  - `WriteConfig`
- Set the env vars for tenant
  - **TENANT_URL** - base url of tenant (eg. https://abc1234.live.dynatrace.com)
  - **TENANT_TOKEN** - API token prepared earlier

## Deploy configuration

```bash
monaco deploy manifest.yaml -v -e dev
```

## Optional: download configuration

```bash
monaco download --manifest manifest.yaml --environment dev \
-s builtin:bizevents.http.incoming \
-s builtin:bizevents-processing-metrics.rule \
-s builtin:bizevents-processing-pipelines.rule
```

## Optional: delete configuration

```bash
monaco generate deletefile manifest.yaml
monaco delete
```

## Capture rule standarization

All bizevents are defined according to these rules:

- rule name:
  - request to nginx proxy: `EasyTrade [nginx] - {HTTP method} {endpoint}`
  - request to every other service `EasyTrade [{service-name} | {technology}] - {HTTP method} {endpoint}`
- triggers: both request `HTTP method` and `path`
- event provider: `www.easytrade.com`
- event type:
  - request to nginx proxy: `com.easytrade.nginx.{name}`
  - request to every other service: `com.easytrade.{name}`
- event category: `request path`

Example:

- rule name: `EasyTrade [broker-service | .NET] - POST /v1/trade/long/buy`
- triggers: `HTTP Method equals 'POST'` and `Path starts with '/v1/trade/long/buy'`
- event provider: `www.easytrade.com`
- event type: `com.easytrade.long-buy`
- event category: `request path` (/v1/trade/long/buy)
