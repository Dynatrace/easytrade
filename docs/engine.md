# easyTradeEngine
Java service used to periodically run scheduled tasks.    
Right now it only tries to finalize long running transactions each 60 seconds.   

<br/><br/>

## Techs
Java   
Docker   

<br/><br/>

## Local build instructions
```sh
docker build -t easytradeengine .
docker run -d --name engine easytradeengine
```   
If you want the service to work properly, you should try setting these ENV variables:   
- BROKER_HOSTANDPORT: broker service host and port, for example "brokerservice:80"   

<br/><br/>

## Endpoints or logic
Swagger endpoint is available at:
```sh
//when deployed locally
http://localhost:8080/api/swagger-ui/

//when deployed with docker-compose
http://localhost:8090/api/swagger-ui/

//when deployed with k8s
http://SOMEWHERE/engine/api/swagger-ui/
```

<br/><br/>

`GET` <b>/api/trade/scheduler/start</b> `(Start long running transaction scheduler)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> None

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8090/api/trade/scheduler/start" -H "accept: */*"
> ```

<br/><br/>

`GET` <b>/api/trade/scheduler/status</b> `(Check scheduler status)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> None

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8090/api/trade/scheduler/status" -H "accept: */*"
> ```

<br/><br/>

`GET` <b>/api/trade/scheduler/stop</b> `(Stop long running transaction scheduler)`

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> None

##### Example cURL
> ```bash
>  curl -X GET "http://172.18.147.235:8090/api/trade/scheduler/stop" -H "accept: */*"
> ```

<br/><br/>

