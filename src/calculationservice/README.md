# easyTradeCalculationService

C++ service that reads some data from RabbitMQ and puts the result on the default output

## Technologies used

- Docker
- C++
- RabbitMQ

## Environment variables

- `RABBITMQ_USER`
- `RABBITMQ_PASSWORD`
- `RABBITMQ_HOST`
- `RABBITMQ_PORT` 
- `RABBITMQ_QUEUE` — Queue name to consume from 
- `HEALTH_PORT` — Health endpoint listen port 

## Health endpoints

The service exposes `/livez` (always `200 OK` while the process is running) and `/readyz` (`200 OK` once the RabbitMQ consume is established, `503` otherwise) on port `HEALTH_PORT`.

## Local build instructions

```bash
docker build -t IMAGE_NAME .
docker run -d --name SERVICE_NAME IMAGE_NAME
```

## Logic

Service runs an endless loop that that tries to consume data from the message queue each 15 seconds.
