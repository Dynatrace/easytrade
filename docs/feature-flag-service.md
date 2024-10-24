# easyTradeFeatureFlagService

A java rest service with swagger. It allows to get and update feature flag data.

## Technologies used

- Java
- Docker

## Endpoints or logic

### Swagger

---

Swagger endpoint is available at:

```bash
# when deployed with k8s
http://{IP_ADDRESS}/feature-flag-service/swagger-ui/index.html
```

### Api v1

---

#### `GET` **/v1/flags/{flagId}** `(Get flag)`

##### Parameters

| name     | type         | data type | description      |
| -------- | ------------ | --------- | ---------------- |
| `flagId` | not required | string    | The id of a flag |

To get all flags, use the same approach but without {FLAGID} parameter.

#### Example cURL

```bash
curl -X GET "http://{IP_ADDRESS}:8094/v1/flags/db_not_responding" -H  "accept: */*"
```

---

#### `GET` **/v1/flags?tag={tag}** `(Get flags by tag)`

##### Parameters

| name  | type     | data type | description    |
| ----- | -------- | --------- | -------------- |
| `tag` | required | string    | The flags' tag |

#### Example cURL

```bash
curl -X GET "http://{IP_ADDRESS}:8094/v1/flags?tag=problem_pattern" -H  "accept: */*"
```

---

#### `PUT` **/v1/flags/{flagId}** `(Enable/disable flag)`

##### Parameters

| name      | type     | data type | description                |
| --------- | -------- | --------- | -------------------------- |
| `flagId`  | required | string    | The id of a flag           |
| `enabled` | required | boolean   | Is the flag enabled or not |

##### Example cURL

```bash
curl -X PUT "http://{IP_ADDRESS}:8094/v1/flags/{flagId}/" -H  "accept: application/json" -d "{\"enabled\": true}"
```

To disable the flag, use the same approach but with the "enabled" parameter set to false.

##### Example of JSON body

```json
{
  "enabled": true
}
```
