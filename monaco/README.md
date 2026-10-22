# Easytrade Monaco configuration

## Setup

- Install the Monaco ([docs](https://www.dynatrace.com/support/help/manage/configuration-as-code/monaco/installation))
- Prepare the API token with permissions
  - _settings.read_
  - _settings.write_
- Prepare OAuthClient
  - _settings:schemas:read_
  - _settings:objects:write_
  - _settings:objects:read_
- Set the env vars for tenant
  - **TENANT_URL** - base url of tenant (eg. https://abc1234.apps.dynatrace.com)
    > **NOTE:** when using oAuth client this must be a new Dynatrace (platform) url
  - **TENANT_TOKEN** - API token prepared earlier
  - **CLIENT_ID** - oauth client id
  - **CLIENT_SECRET** - oauth client secret

## Deploy configuration

The list of available environments and projects can be found in `manifest.yaml`

```bash
# to deploy a project to environment
monaco deploy manifest.yaml -e {{environment-name}} -p {{project-name}}

monaco deploy manifest.yaml -e dev -p oneagent-features   # OneAgent features only
monaco deploy manifest.yaml -e dev -p bizevents           # bizevents (+ oneagent-features they reference)
monaco deploy manifest.yaml -e dev -p bizflow             # bizflows
```

> NOTE: If you want to exclude some parts of the configuration, change `skip: false` to `skip: true` in corresponding `config.yaml`, eg. for the `easytrade_broker-service_quick-buy` bizevent in `bizevents/config.yaml`.

### Secrets

The tokens and oauth clients are provided via env variables, one possible way to make it more manageable is to create `.env` file (or multiple files) which can then be used to load those envs.

> You can use the `.env.example` as a template for your `.env` file. _NOTE:_ don't update it directly as it's tracked by git and you may end up pushing secrets to repository.

```bash
# if you followed the .env.example template you can load envs like this
source .env
monaco deploy ...
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
