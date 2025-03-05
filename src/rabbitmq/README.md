# easyTradeRabbitmq

RabbitMQ service along with its initialization.

## Technologies used

- Docker
- RabbitMQ

## Local build instructions

```bash
# default rabbitmq port is 15672

docker build -t easytraderabbitmq .
docker run -d --name rabbitmq easytraderabbitmq
```
