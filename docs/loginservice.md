# easyTradeLoginService
This .Net service is responsible for authenticating users.   

<br/><br/>

## Techs
.Net Core 5.0   
Docker   

<br/><br/>

## Local build instructions
```sh
docker build -t easytradeloginservice .
docker run -d --name loginservice easytradeloginservice
```   
If you want the service to work properly, you should try setting these ENV variables:   
- MSSQL_CONNECTIONSTRING - data base connection string, for example "Data Source=db;Initial Catalog=TradeManagement;Persist Security Info=True;User ID=sa;Password=yourStrong(!)Password"   


<br/><br/>

## Endpoints or logic
Swagger endpoint is available at:
```sh
//when deployed locally
http://localhost/swagger

//when deployed with docker-compose
http://localhost:8086/swagger

//when deployed with k8s
http://SOMEWHERE/login/swagger
```

<br/><br/>

`GET` <b>/api/Accounts/GetAccountById/{id}</b> `(Get account by id)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `id` | required | int | Account id |

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8086/api/Accounts/GetAccountById/1" -H  "accept: text/plain"
> ```

<br/><br/>

`GET` <b>/api/Accounts/GetAccountByUsername/{username}</b> `(Get account by username)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `username` | required | string | Some account's username |

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8086/api/Accounts/GetAccountByUsername/labuser" -H  "accept: text/plain"
> ```

<br/><br/>

`POST` <b>/api/Accounts/CreateNewAccount</b> `(Create a new account)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `packageId` | required | int | Selected package id |
> | `firstName` | required | string | First name |
> | `lastName` | required | string | Last name |
> | `username` | required | string | Username |
> | `email` | required | string | Email |
> | `hashedPassword` | required | string | Hashed password |
> | `origin` | required | string | Where user creation originated |

##### Example cURL
> ```bash
>  curl -X POST "http://172.18.147.235:8086/api/Accounts/CreateNewAccount" -H  "accept: text/plain" -H  "Content-Type: application/json" -d "{\"packageId\":2,\"firstName\":\"John\",\"lastName\":\"Doe\",\"username\":\"johndoe678\",\"email\":\"johndoe678\",\"hashedPassword\":\"811210924d294539f709c651ae477768110bdf39005c877bb32bf495b56ce6bd\",\"origin\":\"Via Swagger\"}"
> ```

##### Example of JSON body
> ```json
>{
>  "packageId": 2,
>  "firstName": "John",
>  "lastName": "Doe",
>  "username": "johndoe678",
>  "email": "johndoe678",
>  "hashedPassword": "811210924d294539f709c651ae477768110bdf39005c877bb32bf495b56ce6bd",
>  "origin": "Via Swagger"
>}
> ```

<br/><br/>


