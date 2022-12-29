# easyTradeRabbitmq
RabbitMQ service along with its initialization.   

<br/><br/>

## Techs
RabbitMQ   
Docker   

<br/><br/>

## Local build instructions
```sh
//default rabbitmq port is 15672

docker build -t easytraderabbitmq .
docker run -d --name rabbitmq easytraderabbitmq
```   

<br/><br/>

## Endpoints or logic
After starting image, the management console will be available at
```sh
//when deployed locally
http://localhost:15672

//when deployed with docker-compose
http://localhost:8082

//when deployed with k8s
Not available
```

<br/><br/>


