# easyTradeLoginService

This .Net service is responsible for authenticating users.

## Technologies used

- .NET 8.0
- Docker

## Local build instructions

```bash
docker build -t easytradeloginservice .
docker run -d --name loginservice easytradeloginservice
```

If you want the service to work properly, you should try setting these ENV variables:

| Name                   | Description                         | Default                                                                                                             |
| ---------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| MSSQL_CONNECTIONSTRING | data base connection string         | Data Source=db;Initial Catalog=TradeManagement;Persist Security Info=True;User ID=sa;Password=yourStrong(!)Password |
| PROXY_PREFIX           | prefix identifying service in nginx | login                                                                                                               |

## Endpoints or logic

### Swagger

---

Swagger endpoint is available at:

```bash
# when deployed locally
http://localhost/swagger

# when deployed with compose.dev.yaml
http://localhost:8086/swagger

# when deployed with k8s
http://SOMEWHERE/loginservice/swagger
```

Version endpoint is available at `/api/version`

### Endpoints

---

#### `GET` **/api/Accounts/GetAccountById/{id}** `(Get account by id)`

##### Parameters

> | name | type     | data type | description |
> | ---- | -------- | --------- | ----------- |
> | `id` | required | int       | Account id  |

##### Example cURL

> ```bash
>  curl -X GET "http://{IP_ADDRESS}:8086/api/Accounts/GetAccountById/1" -H  "accept: text/plain"
> ```

---

#### `GET` **/api/Accounts/GetAccountByUsername/{username}** `(Get account by username)`

##### Parameters

> | name       | type     | data type | description             |
> | ---------- | -------- | --------- | ----------------------- |
> | `username` | required | string    | Some account's username |

##### Example cURL

> ```bash
>  curl -X GET "http://{IP_ADDRESS}:8086/api/Accounts/GetAccountByUsername/userName" -H  "accept: text/plain"
> ```

---

#### `POST` **/api/Accounts/CreateNewAccount** `(Create a new account)`

##### Parameters

> | name             | type     | data type | description                    |
> | ---------------- | -------- | --------- | ------------------------------ |
> | `packageId`      | required | int       | Selected package id            |
> | `firstName`      | required | string    | First name                     |
> | `lastName`       | required | string    | Last name                      |
> | `username`       | required | string    | Username                       |
> | `email`          | required | string    | Email                          |
> | `hashedPassword` | required | string    | Hashed password                |
> | `origin`         | required | string    | Where user creation originated |

##### Example cURL

> ```bash
>  curl -X POST "http://{IP_ADDRESS}:8086/api/Accounts/CreateNewAccount" -H  "accept: text/plain" -H  "Content-Type: application/json" -d "{\"packageId\":2,\"firstName\":\"John\",\"lastName\":\"Doe\",\"username\":\"johndoe678\",\"email\":\"johndoe678\",\"hashedPassword\":\"811210924d294539f709c651ae477768110bdf39005c877bb32bf495b56ce6bd\",\"origin\":\"Via Swagger\"}"
> ```

##### Example of JSON body

> ```json
> {
>   "packageId": 2,
>   "firstName": "John",
>   "lastName": "Doe",
>   "username": "johndoe678",
>   "email": "johndoe678",
>   "hashedPassword": "811210924d294539f709c651ae477768110bdf39005c877bb32bf495b56ce6bd",
>   "origin": "Via Swagger"
> }
> ```
