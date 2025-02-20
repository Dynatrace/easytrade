# easyTradeCalculationService

C++ service that reads some data from RabbitMQ and puts the result on the default output

## Technologies used

- C++
- RabbitMQ
- Docker

## Local build instructions

```bash
docker build -t easytradecalculationservice .
docker run -d --name calculationservice easytradecalculationservice
```

## Endpoints or logic

The service has no endpoints - it is running an endless loop that checks if there is some data to consume in the message queue each 15 seconds.
