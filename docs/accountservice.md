# easyTradeAccountService

A java rest service with swagger. It allows to get and update account data.

## Technologies used

- Docker
- Java

## Endpoints or logic

### Swagger

---

Swagger endpoint is available at:

```bash
# when deployed with k8s
http://SOMEWHERE/accountservice/api/swagger-ui/
```

### Api V1

---

#### `GET` **/api/account/{accountId}** `(get account)`

##### Parameters

| name        | type     | data type | description                     |
| ----------- | -------- | --------- | ------------------------------- |
| `accountId` | required | int       | The specific account numeric id |

##### Example cURL

```bash
curl -X GET "http://{IP_ADDRESS}:8089/api/account/1" -H "accept: */*"
```

---

#### `PUT` **/api/account/update** `(update account)`

##### Parameters

| name                    | type     | data type | description                                                                     |
| ----------------------- | -------- | --------- | ------------------------------------------------------------------------------- |
| `id`                    | required | int       | The specific account numeric id                                                 |
| `packageId`             | required | int       | The specific package numeric id                                                 |
| `firstName`             | required | string    | First name                                                                      |
| `lastName`              | required | string    | Last name                                                                       |
| `username`              | required | string    | Username                                                                        |
| `email`                 | required | string    | Email address                                                                   |
| `hashedPassword`        | required | string    | The hashed password                                                             |
| `availableBalance`      | required | decimal   | Current account's cash balance                                                  |
| `origin`                | required | string    | What is the account's origin - preset, registered manually or via offer service |
| `creationDate`          | required | dateTime  | Account's creation time                                                         |
| `packageActivationDate` | required | dateTime  | When was the package activated/bought                                           |
| `accountActive`         | required | boolean   | Shows whether the account is still active                                       |

##### Example cURL

```bash
curl -X PUT \
"http://{IP_ADDRESS}:8089/api/account/update" \
-H "accept: */*" \
-H "Content-Type: application/json" \
-d '{
    "id": 2,
    "packageId": 1,
    "firstName": "Lab",
    "lastName": "User",
    "username": "labuser",
    "email": "lab.user@dynatrace.com",
    "hashedPassword": "f7d048204bb7d898447148643429481bb3bfc70eefb126ad37fe577c4ffd1381",
    "availableBalance": 17,
    "origin": "PRESET",
    "creationDate": "2021-08-11T13:00:00.000+00:00",
    "packageActivationDate": "2021-08-11T13:00:00.000+00:00",
    "accountActive": true
}'
```

##### Example of JSON body

```json
{
  "id": 2,
  "packageId": 1,
  "firstName": "Lab",
  "lastName": "User",
  "username": "labuser",
  "email": "lab.user@dynatrace.com",
  "availableBalance": 16,
  "origin": "PRESET",
  "creationDate": "2021-08-11T13:00:00",
  "packageActivationDate": "2021-08-11T13:00:00",
  "accountActive": true
}
```

### Api V2

---

#### `GET` **/api/accounts/{accountId}** `(get account)`

##### Parameters

| name        | type     | data type | description                     |
| ----------- | -------- | --------- | ------------------------------- |
| `accountId` | required | int       | The specific account numeric id |

##### Example cURL

```bash
 curl -X GET "http://{IP_ADDRESS}:8089/api/accounts/1" -H "accept: */*"
```

---

#### `GET` **/api/accounts/preset?limit** `(get list of preset accounts)`

##### Parameters

| name    | type  | data type | description                                 |
| ------- | ----- | --------- | ------------------------------------------- |
| `limit` | query | int       | The maximum length of list sent in response |

##### Example cURL

```bash
 curl -X GET "http://{IP_ADDRESS}:8089/api/accounts/preset?limit1" -H "accept: */*"
```

---

#### `PUT` **/api/accounts** `(update account)`

##### Parameters

| name                    | type     | data type | description                                                                     |
| ----------------------- | -------- | --------- | ------------------------------------------------------------------------------- |
| `id`                    | required | int       | The specific account numeric id                                                 |
| `packageId`             | required | int       | The specific package numeric id                                                 |
| `firstName`             | required | string    | First name                                                                      |
| `lastName`              | required | string    | Last name                                                                       |
| `username`              | required | string    | Username                                                                        |
| `email`                 | required | string    | Email address                                                                   |
| `hashedPassword`        | required | string    | The hashed password                                                             |
| `availableBalance`      | required | decimal   | Current account's cash balance                                                  |
| `origin`                | required | string    | What is the account's origin - preset, registered manually or via offer service |
| `creationDate`          | required | dateTime  | Account's creation time                                                         |
| `packageActivationDate` | required | dateTime  | When was the package activated/bought                                           |
| `accountActive`         | required | boolean   | Shows whether the account is still active                                       |

##### Example cURL

```bash
curl -X PUT \
"http://{IP_ADDRESS}:8089/api/account/update" \
-H "accept: */*" \
-H "Content-Type: application/json" \
-d '{
    "id": 2,
    "packageId": 1,
    "firstName": "Lab",
    "lastName": "User",
    "username": "labuser",
    "email": "lab.user@dynatrace.com",
    "hashedPassword": "f7d048204bb7d898447148643429481bb3bfc70eefb126ad37fe577c4ffd1381",
    "availableBalance": 17,
    "origin": "PRESET",
    "creationDate": "2021-08-11T13:00:00.000+00:00",
    "packageActivationDate": "2021-08-11T13:00:00.000+00:00",
    "accountActive": true
}'
```

##### Example of JSON body

```json
{
  "id": 2,
  "packageId": 1,
  "firstName": "Lab",
  "lastName": "User",
  "username": "labuser",
  "email": "lab.user@dynatrace.com",
  "availableBalance": 16,
  "origin": "PRESET",
  "creationDate": "2021-08-11T13:00:00",
  "packageActivationDate": "2021-08-11T13:00:00",
  "accountActive": true
}
```
