# easyTradeManager

This service performs the role of a data access layer to database. Almost all calls to database go through it.

## Technologies used

- .NET 8
- Docker

Manager has support for one problem pattern - DbNotRespondingPlugin. When this problem pattern is enabled, no new records will be added to Trade table, as they will fail.  
Problem pattern can be enabled manually with an endpoint, or via the PluginService

## Endpoints or logic

> Manager is not exposed by reverse proxy so this is not available outside of the deployment

### Swagger

---

Swagger endpoint is available at:

```bash
# when deployed with k8s
http://SOMEWHERE/manager/swagger
```

### Accounts

---

#### `GET` **/api/Accounts/GetAccountById/{id}** `(Get account by id)`

##### Parameters

| name | type     | data type | description |
| ---- | -------- | --------- | ----------- |
| `id` | required | int       | Account id  |

##### Example cURL

```bash
 curl -X GET "http://{IP_ADDRESS}:8081/api/Accounts/GetAccountById/1" -H  "accept: text/plain"
```

---

#### `PUT` **/api/Accounts/ModifyAccount** `(Update account info)`

##### Parameters

| name                    | type     | data type | description                    |
| ----------------------- | -------- | --------- | ------------------------------ |
| `id`                    | required | int       | Account id                     |
| `packageId`             | required | int       | Package id                     |
| `firstName`             | required | string    | First name                     |
| `lastName`              | required | string    | Last name                      |
| `username`              | required | string    | Username                       |
| `email`                 | required | string    | Email                          |
| `hashedPassword`        | required | string    | Password hash                  |
| `availableBalance`      | required | decimal   | Current account balance        |
| `origin`                | required | DATA_TYPE | How was the account created    |
| `creationDate`          | required | dateTime  | When was the account created   |
| `packageActivationDate` | required | dateTime  | When was the package activated |
| `accountActive`         | required | boolean   | Is the account active?         |

##### Example cURL

```bash
 curl -X PUT "http://{IP_ADDRESS}:8081/api/Accounts/ModifyAccount" -H  "accept: */*" -H  "Content-Type: application/json" -d '{"id":7,"packageId":1,"firstName":"Jessica","lastName":"Smithin","username":"jessica_smith","email":"jessica.smith@gmail.com","hashedPassword":"139990b95cf8e8fddcb6e3202ed92a216d656a5bbe8ebb2a28bfe9911e6c3c51","availableBalance":425542.73326551,"origin":"PRESET","creationDate":"2021-08-11T13:00:00","packageActivationDate":"2021-08-11T13:00:00","accountActive":true}'
```

##### Example of JSON body

```json
{
  "id": 7,
  "packageId": 1,
  "firstName": "Jessica",
  "lastName": "Smithin",
  "username": "jessica_smith",
  "email": "jessica.smith@gmail.com",
  "hashedPassword": "139990b95cf8e8fddcb6e3202ed92a216d656a5bbe8ebb2a28bfe9911e6c3c51",
  "availableBalance": 425542.73326551,
  "origin": "PRESET",
  "creationDate": "2021-08-11T13:00:00",
  "packageActivationDate": "2021-08-11T13:00:00",
  "accountActive": true
}
```

---

#### `GET` **/api/Accounts** `(Get all accounts)`

##### Example cURL

```bash
curl -X 'GET' \
'http://{IP_ADDRESS}/manager/api/Accounts' \
-H 'accept: text/plain'
```

### Packages

---

#### `GET` **/api/Packages/GetPackageById/{id}** `(Get package record by id)`

##### Parameters

| name | type     | data type | description |
| ---- | -------- | --------- | ----------- |
| `id` | required | int       | Package id  |

##### Example cURL

```bash
 curl -X GET "http://{IP_ADDRESS}:8081/api/Packages/GetPackageById/1" -H  "accept: text/plain"
```

---

#### `GET` **/api/Packages/GetPackages** `(Get package list)`

##### Example cURL

```bash
 curl -X GET "http://{IP_ADDRESS}:8081/api/Packages/GetPackages" -H  "accept: text/plain"
```

### Products

---

#### `GET` **/api/Products/GetProductById/{id}** `(Get product record by id)`

##### Parameters

| name | type     | data type | description |
| ---- | -------- | --------- | ----------- |
| `id` | required | int       | Product id  |

##### Example cURL

```bash
 curl -X GET "http://{IP_ADDRESS}:8081/api/Products/GetProductById/1" -H  "accept: text/plain"
```

---

#### `GET` **/api/Products/GetProducts** `(Get product list)`

##### Example cURL

```bash
 curl -X GET "http://{IP_ADDRESS}:8081/api/Products/GetProducts" -H  "accept: text/plain"
```
