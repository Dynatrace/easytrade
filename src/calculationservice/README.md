# easyTradeCalculationService

C++ service that reads some data from RabbitMQ and puts the result on the default output

## Technologies used

- Docker
- C++
- RabbitMQ

## Local build instructions

```bash
docker build -t IMAGE_NAME .
docker run -d --name SERVICE_NAME IMAGE_NAME
```

## Logic

Service runs an endless loop that that tries to consume data from the message queue each 15 seconds.
