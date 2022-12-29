# easyTradeCalculationService
C++ service that reads some data from RabbitMQ and puts the result on the default output   

<br/><br/>

## Techs
C++   
RabbitMQ   
Docker   

<br/><br/>

## Local build instructions
```sh
docker build -t easytradecalculationservice .
docker run -d --name calculationservice easytradecalculationservice
```

<br/><br/>

## Endpoints or logic
The service has no endpoints - it is running an endless loop that checks if there is some data to consume in the message queue each 15 seconds.


