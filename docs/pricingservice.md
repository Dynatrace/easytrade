# easyTradePricingService
A .Net service that provides information about instruments prices.   

<br/><br/>

## Techs
.Net Core 5.0   
Docker  

<br/><br/>

## Local build instructions
```sh
docker build -t easytradepricingservice .
docker run -d --name pricingservice easytradepricingservice
```   
If you want the service to work properly, you should try setting these ENV variables:
- MANAGER_HOSTANDPORT - manager host and port, for example "manager:80"
- RABBITMQ_HOST - rabbitmq host, for example "rabbitmq"
- RABBITMQ_USER - rabbitmq user, for example "userxxx"
- RABBITMQ_PASSWORD - rabbitmq user's password, for example "passxxx"

<br/><br/>

## Endpoints or logic
Swagger endpoint is available at:
```sh
//when deployed locally
http://localhost/swagger

//when deployed with docker-compose
http://localhost:8083/swagger

//when deployed with k8s
http://SOMEWHERE/pricing/swagger
```

<br/><br/>

`GET` <b>/api/Pricing/GetLastPrice</b> `(Returns the newest price record)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> None

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8083/api/Pricing/GetLastPrice" -H  "accept: text/plain"
> ```

<br/><br/>

`GET` <b>/api/Pricing/GetLatestPrices</b> `(Get latest price of each instrument)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> None

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8083/api/Pricing/GetLatestPrices" -H  "accept: text/plain"
> ```

<br/><br/>

`GET` <b>​/api​/Pricing​/GetPricingDataForInstrument​/{instrumentId}​/{records}</b> `(Get pricing data for a given instruments)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `instrumentId` | required | int | Instrument id |
> | `records` | not required | int | How many records to return. Defaults to 100 |

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8083/api/Pricing/GetPricingDataForInstrument/1/100" -H  "accept: text/plain"
> ```

