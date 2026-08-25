# EasyTrade

A project consisting of many small services that connect to each other.  
It is made like a stock broking application - it allows it's users to buy&sell some stocks/instruments.  
Of course it is all fake data and the price has a 24 hour cycle...

## Architecture diagram

## Dependency graph

Generated from `compose.dev.yaml` via `make update-graph` — do not edit the block below by hand.

<!-- dependency-graph:start -->
```mermaid
flowchart TD
    background-service --> db-adapter
    background-service --> offerservice
    broker-service --> db
    broker-service --> feature-flag-service
    broker-service --> pricing-service
    broker-service --> user-service
    credit-card-order-service --> background-service
    credit-card-order-service --> db
    db-adapter --> db
    frontendreverseproxy --> background-service
    frontendreverseproxy --> broker-service
    frontendreverseproxy --> credit-card-order-service
    frontendreverseproxy --> feature-flag-service
    frontendreverseproxy --> frontend
    frontendreverseproxy --> offerservice
    frontendreverseproxy --> pricing-service
    loadgen --> frontendreverseproxy
    offerservice --> feature-flag-service
    offerservice --> manager
    offerservice --> user-service
    pricing-service --> db
    user-service --> db-adapter
    background-service -.-> credit-card-order-service
    background-service -.-> feature-flag-service
    credit-card-order-service -.-> feature-flag-service

    class broker-service dotnet
    class background-service,db-adapter,feature-flag-service,pricing-service,user-service go
    class credit-card-order-service java
    class frontend,loadgen,offerservice node
    class db,frontendreverseproxy other
    class manager otherOffCompose

    classDef dotnet fill:#d2b4de,stroke:#6c3483,color:#1a1a1a,stroke-width:1px
    classDef go fill:#a9cce3,stroke:#1f618d,color:#1a1a1a,stroke-width:1px
    classDef java fill:#f8b4b4,stroke:#c0392b,color:#1a1a1a,stroke-width:1px
    classDef node fill:#a9dfbf,stroke:#1e8449,color:#1a1a1a,stroke-width:1px
    classDef other fill:#d5d8dc,stroke:#5d6d7e,color:#1a1a1a,stroke-width:1px
    classDef otherOffCompose fill:#d5d8dc,stroke:#5d6d7e,color:#1a1a1a,stroke-width:1px,stroke-dasharray:5 5

    subgraph Legend[Legend: implementation language]
        direction LR
        legend_dotnet["C# / .NET"]:::dotnet
        legend_go["Go"]:::go
        legend_java["Java"]:::java
        legend_node["TypeScript / Node.js"]:::node
        legend_other["Other / config (no language manifest)"]:::other
    end
```
<!-- dependency-graph:end -->

- solid arrow: `depends_on` in compose
- dashed arrow: inferred from an environment variable value referencing another service
- dashed border: no entry in `compose.dev.yaml` (e.g. Kubernetes-only or build-only service)
- node color: implementation language, detected from the service's manifest file (see the "Legend" group inside the diagram)

## Service list

EasyTrade consists of the following services/components:

| Service                                                              | Proxy port | Proxy endpoint               |
| -------------------------------------------------------------------- | ---------- | ---------------------------- |
| [Background service](src/background-service/README.md)               | 80         | `/background-service`        |
| [Broker service](src/broker-service/README.md)                       | 80         | `/broker-service`            |
| [Content creator](src/contentcreator/README.md)                      | 80         | `---`                        |
| [Credit card order service](src/credit-card-order-service/README.md) | 80         | `/credit-card-order-service` |
| [Db](src/db/README.md)                                               | 80         | `---`                        |
| [Db adapter](src/db-adapter/README.md)                               | --         | `---`                        |
| [Feature flag service](src/feature-flag-service/README.md)           | 80         | `/feature-flag-service`      |
| [Frontend](src/frontend/README.md)                                   | 80         | `/`                          |
| [Frontend reverse-proxy](src/frontendreverseproxy/README.md)         | 80         | `---`                        |
| [Loadgen](src/loadgen/README.md)                                     | --         | `---`                        |
| [Offer service](src/offerservice/README.md)                          | 80         | `/offerservice`              |
| [Pricing service](src/pricing-service/README.md)                     | 80         | `/pricing-service`           |
| [Problem operator](src/problem-operator/README.md)                   | 80         | `---`                        |
| [User service](src/user-service/README.md)                           | 80         | `/user-service`               |

> To learn more about endpoints / swagger for the services go to their respective readmes

## Docker compose

To run the easytrade using docker you can use provided `compose.yaml`.
To use it you need to have:

- Docker with minimal version **v20.10.13**
  - you can follow [this](https://docs.docker.com/engine/install/ubuntu/) guide to update Docker
  - this guide also covers installing Docker Compose Plugin
- Docker Compose Plugin
  ```bash
  sudo apt update
  sudo apt install docker-compose-plugin
  ```
  - more information in [this](https://docs.docker.com/compose/install/linux/) guide

With this you can run

```bash
docker compose up
# or to run in the background
docker compose up -d
```

You should be able to access the app at `localhost:80` or simply `localhost`.

> **NOTE:** It make take a few minutes for the app to stabilize, you may experience errors in the frontend or see missing data before that happens.

> **NOTE:** Docker Compose V1 which came as a separate binary (`docker-compose`) will not work with this version. You can check this [guide](https://www.howtogeek.com/devops/how-to-upgrade-to-docker-compose-v2/) on how to upgrade.

## Local development

The root `Makefile` wraps the compose and Helm commands you need while working on
the code. It builds images from local source (`compose.dev.yaml`) rather than
pulling them from the registry.

```bash
make help    # list every target
```

```bash
make build            # build all images from local source
make start            # start the whole stack, building anything missing
make stop             # stop the stack and remove its containers
make clean            # ...and also drop volumes and locally built images
```

Every compose target accepts an optional `services=` to narrow the scope — a single
name, or a quoted space-separated list. Omit it to act on the whole stack:

```bash
make build services=pricing-service
make start services="db frontendreverseproxy contentcreator"
```

Two targets act on exactly one service and therefore require `services=`:

```bash
make restart  services=frontend   # recreate the container, no rebuild
make redeploy services=frontend   # rebuild the image, then recreate — use after a code change
```

The dev stack publishes each service on its own host port (`manager` 8081,
`pricing-service` 8083, `broker-service` 8084, `offerservice` 8087,
`user-service` 8089, `credit-card-order-service` 8091, `frontend` 8092,
`third-party-service` 8093, `feature-flag-service` 8094, `db-adapter` 50051,
`db` 1433/5432), so you can hit a service directly instead of going through nginx.

To run the pre-built registry images through the Makefile instead, use
`make start-remote`.

## Kubernetes instructions

To deploy Easytrade in kubernetes you need to have:

- `helm`
  - install [guide](https://helm.sh/docs/intro/install/)
- `kubectl`
  - install [guide](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/)
- `kubeconfig` to access the cluster you want to deploy it on
  - more info on it [here](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/)

Using the Makefile (release name and namespace both default to `easytrade`):

```bash
# create namespace and deploy easytrade from the published chart
make k8s-install-remote

# ...or from the chart in this repo, e.g. to test local chart changes
make k8s-install

# uninstall easytrade
make k8s-uninstall
```

Both install targets are idempotent (`helm upgrade --install`), so re-running one
upgrades an existing release. Override the defaults per invocation:

```bash
make k8s-install HELM_RELEASE=easytrade-test HELM_NAMESPACE=easytrade-test
```

The equivalent raw commands:

```bash
# create namespace and deploy easytrade
helm install easytrade oci://europe-docker.pkg.dev/dynatrace-demoability/helm/easytrade --create-namespace --namespace easytrade

# uninstall easytrade
helm uninstall easytrade -n easytrade

# delete namespace
kubectl delete namespace easytrade
```

## Where to start

After starting easyTrade application you can:

- go to the frontend and try it out. Just go to the machines IP address, or "localhost" and you should see the login page. You can either create a new user, or use one of superusers (with easy passwords) like "demouser/demopass" or "specialuser/specialpass". Remember that in order to buy stocks you need money, so visit the deposit page first.
- go to some services swagger endpoint - you will find proper instructions in the dedicated service readmes.
- after some time go to dynatrace to configure your application and see what is going on in easyTrade - to have it work you will need an agent on the machine where you started easyTrade :P

## EasyTrade users

If you want to use easyTrade, then you will need a user. You can either:

- use the existing user - he has some preinserted data and new data is being generated from time to time:

  - login: james_norton
  - pass: pass_james_123

- create a new user - click on "Sign up" on the login page and create a new user.

> **NOTE:** After creating a new user there is no confirmation given, no email sent and you are not redirected... Just go back to login page and try to login. It should work :)

## Problem patterns

Currently there are 4 problem patterns supported in easyTrade:

1. DbNotResponding - after turning it on no new trades can be created as the database will throw an error. This problem pattern is kind of proof on concept that problem patterns work. Running it for around 20 minutes should generate a problem in dynatrace.

2. ErgoAggregatorSlowdown - after turning it on 2 of the aggregators will start receiving slower responses which will make them stop sending requests after some time. A potential run could take:

   - 15 min - then we will notice a small slowdown (for 150 seconds) followed by 40% lower traffic for 15 minutes on some requests
   - 20 min - then we will notice a small slowdown (for 150 seconds) followed by 40% lower traffic for 30 minutes on some requests

3. FactoryCrisis - when enabled, the factory won't produce new cards, which will cause background-service's manufacture scheduler not to process credit card orders. This will block the Credit Card Order service.

4. HighCpuUsage - this problem pattern causes a slowdown of broker-service response time and highly increases CPU usage during that time. If the app is deployed on K8s, a CPU resource limit is also applied by background-service's operator subsystem. This should generate CPU throttling on the pod.

To turn a plugin on/off send a request similar to the following:

```sh
curl -X PUT "http://{IP_ADDRESS}/feature-flag-service/v1/flags/{FEATURE_ID}/" \
-H  "accept: application/json" \
-d '{"enabled": {VALUE}}'
```

You can also manage enabled problem patterns via the easyTrade frontend.

> **NOTE:** More information on the feature flag service's parameters available in [feature flag service's doc](src/feature-flag-service/README.md).

If you are deploying easyTrade on K8s, you can also apply [these cronjobs](./kubernetes-manifests/problem-patterns/), which will enable the problem patterns once a day.

## EasyTrade on Dynatrace - how to configure

All Dynatrace configuration required for Easytrade should be applied using [Monaco](https://github.com/Dynatrace/dynatrace-configuration-as-code). More information on how to deploy it can be found in the [`monaco` directory](./monaco).

### Business events in Dynatrace

EasyTrade application has been developed in order to showcase business events. Usually business events can be created in two ways:

- directly - using one of Dynatrace SDKs in the code - so for example in Javascript or Java
- indirectly - configure catch rules for request that are monitored by Dynatrace

If you want to learn more about business events then we suggest looking at the information on our website: [Business event capture](https://www.dynatrace.com/support/help/platform-modules/business-analytics/ba-events-capturing). There you will find information on how to create events directly (with OpenKit, Javascript, Android and more) and indirectly with capture rules in Dynatrace.

For those interested in creating capturing rules for easyTrade we suggest to have a look at the configuration exported with Monaco in this repository. Have a look at the [README](./monaco/README.md)

## Body types

EasyTrade network traffic is handled by REST requests using mostly JSON payloads. However, some of the services
can also handle XML requests. Data types are negotiated based on `Accept` and `Content-Type` headers.

#### XML compatible services

| Service                                                           | Accepted XML MIME types                            |
| ----------------------------------------------------------------- | -------------------------------------------------- |
| [CreditCardOrderService](src/credit-card-order-service/README.md) | `application/xml`                                  |
| [OfferService](src/offerservice/README.md)                        | `application/xml`; `text/xml`                      |
| [PricingService](src/pricing-service/README.md)                   | `application/xml`                                  |

## Local Dynatrace MCP Server

This repository comes with the [local Dynatrace MCP Server](https://github.com/dynatrace-oss/dynatrace-mcp) pre-configured for VSCode. You can read more about [MCP Servers on VSCode](https://code.visualstudio.com/docs/copilot/customization/mcp-servers).
In order to try it out, you need access to the [Dynatrace Playground Environment](https://docs.dynatrace.com/docs/discover-dynatrace#playground), as well as access to [GitHub Copilot](https://github.com/features/copilot).

If everything is setup, please open **Copilot Chat** in VSCode, switch to **Agent mode**, and ask questions like 

> Which environment am I connected to?

> Are there any problems with my components on Dynatrace?

> Are there any security vulnerabilities for my component?
