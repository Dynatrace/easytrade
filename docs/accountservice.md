# easyTradeAccountService
A java rest service with swagger. It allows to get and update accout data.

<br/><br/>

## Techs
Java  
Docker

<br/><br/>

## Local build instructions
```sh
docker build -t easytradeaccountservice .
docker run -d --name accountservice easytradeaccountservice
```
If you want the service to work properly, you should try setting these ENV variables:
- MANAGER_HOSTANDPORT - host and port of the manager, for example "manager:80"

<br/><br/>

## Endpoints or logic
Swagger endpoint is available at:
```sh
//when deployed locally
http://localhost:8080/api/swagger-ui/

//when deployed with docker-compose
http://localhost:8089/api/swagger-ui/

//when deployed with k8s
http://SOMEWHERE/accountservice/api/swagger-ui/
```

<br/><br/>

`GET` <b>/api/account/{accountId}</b> `(get account)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `accountId` | required | int | The specific account numeric id |

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8089/api/account/1" -H "accept: */*"
> ```

<br/><br/>

`PUT` <b>/api/account/update</b> `(update account)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `id` |  required | int   | The specific account numeric id |
> | `packageId` |  required | int   | The specific package numeric id |
> | `firstName` |  required | string | First name |
> | `lastName` |  required | string | Last name |
> | `username` |  required | string | Username |
> | `email` |  required | string | Email address |
> | `hashedPassword` |  required | string | The hashed password |
> | `availableBalance` |  required | decimal | Current account's cash balance |
> | `origin` |  required | string | What is the account's origin - preset, registered manually or via offer service |
> | `creationDate` |  required | dateTime | Account's creation time |
> | `packageActivationDate` |  required | dateTime | When was the package activated/bought |
> | `accountActive` |  required | boolean | Shows whether the account is still active |

##### Example cURL
> ```bash
>  curl -X PUT "http://172.18.147.235:8089/api/account/update" -H "accept: */*" -H "Content-Type: application/json" -d "{ \"id\": 2, \"packageId\": 1, \"firstName\": \"Lab\", \"lastName\": \"User\", \"username\": \"labuser\", \"email\": \"lab.user@dynatrace.com\", \"hashedPassword\": \"f7d048204bb7d898447148643429481bb3bfc70eefb126ad37fe577c4ffd1381\", \"availableBalance\": 17, \"origin\": \"PRESET\", \"creationDate\": \"2021-08-11T13:00:00.000+00:00\", \"packageActivationDate\": \"2021-08-11T13:00:00.000+00:00\", \"accountActive\": true}"
> ```

##### Example of JSON body
> ```json
>{
>  "id": 2,
>  "packageId": 1,
>  "firstName": "Lab",
>  "lastName": "User",
>  "username": "labuser",
>  "email": "lab.user@dynatrace.com",
>  "availableBalance": 16,
>  "origin": "PRESET",
>  "creationDate": "2021-08-11T13:00:00",
>  "packageActivationDate": "2021-08-11T13:00:00",
>  "accountActive": true
>}
> ```

<br/><br/>

