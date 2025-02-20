# easyTradeFeatureFlagService

A java rest service with swagger. It allows to get and update feature flag data.

## Technologies used

- Java
- Docker

## Flag values

You can use environment variables to configure the initial state of the service

| NAME                            | DESCRIPTION                               | DEFAULT |
| ------------------------------- | ----------------------------------------- | ------- |
| ENABLE_MODIFY                   | Allow for modifying the flags             | true    |
| ENABLE_FRONTEND_MODIFY          | Allow for modifying the flags on frontend | true    |
| ENABLE_DB_NOT_RESPONDING        | Check relevant problem description        | false   |
| ENABLE_ERGO_AGGREGATOR_SLOWDOWN | Check relevant problem description        | false   |
| ENABLE_FACTORY_CRISIS           | Check relevant problem description        | false   |
| ENABLE_CREDIT_CARD_MELTDOWN     | Check relevant problem description        | false   |
| ENABLE_HIGH_CPU_USAGE           | Check relevant problem description        | false   |

## Local build instructions

```bash
docker build -t featureflagservice .
docker run -d --name featureflagservice easytradefeatureflagservice
```

If you want the service to work properly, you should try setting these ENV variables:

| Name                | Description                         | Default              |
| ------------------- | ----------------------------------- | -------------------- |
| MANAGER_HOSTANDPORT | host and port of the manager        | manager:8080         |
| PROXY_PREFIX        | prefix identifying service in nginx | feature-flag-service |

## Endpoints or logic

### Swagger

---

Swagger endpoint is available at:

```bash
# when deployed locally
http://localhost:8080/swagger-ui/index.html

# when deployed with compose.dev.yaml
http://localhost:8094/swagger-ui/index.html

# when deployed with k8s
http://{IP_ADDRESS}/feature-flag-service/swagger-ui/index.html
```

Version endpoint is available at `/version`

### Api v1

---

#### `GET` **/v1/flags/{flagId}** `(Get flag)`

##### Parameters

> | name     | type         | data type | description      |
> | -------- | ------------ | --------- | ---------------- |
> | `flagId` | not required | string    | The id of a flag |

To get all flags, use the same approach but without {FLAGID} parameter.

#### Example cURL

> ```bash
>  curl -X GET "http://{IP_ADDRESS}:8094/v1/flags/db_not_responding" -H  "accept: */*"
> ```

---

#### `GET` **/v1/flags?tag={tag}** `(Get flags by tag)`

##### Parameters

> | name  | type     | data type | description    |
> | ----- | -------- | --------- | -------------- |
> | `tag` | required | string    | The flags' tag |

#### Example cURL

> ```bash
>  curl -X GET "http://{IP_ADDRESS}:8094/v1/flags?tag=problem_pattern" -H  "accept: */*"
> ```

---

#### `PUT` **/v1/flags/{flagId}** `(Enable/disable flag)`

##### Parameters

> | name      | type     | data type | description                |
> | --------- | -------- | --------- | -------------------------- |
> | `flagId`  | required | string    | The id of a flag           |
> | `enabled` | required | boolean   | Is the flag enabled or not |

##### Example cURL

> ```bash
>  curl -X PUT "http://{IP_ADDRESS}:8094/v1/flags/{flagId}/" -H  "accept: application/json" -d "{\"enabled\": true}"
> ```

To disable the flag, use the same approach but with the "enabled" parameter set to false.

##### Example of JSON body

> ```json
> {
>   "enabled": true
> }
> ```
