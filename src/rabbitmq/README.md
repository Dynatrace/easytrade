# easyTradeRabbitmq

RabbitMQ service along with its initialization.

## Technologies used

- RabbitMQ
- Docker

## Local build instructions

```bash
# default rabbitmq port is 15672

docker build -t easytraderabbitmq .
docker run -d --name rabbitmq easytraderabbitmq
```

## Endpoints or logic

### RabbitMQ management console

After starting image, the management console will be available at

```bash
# when deployed locally
http://localhost:15672

# when deployed with compose.dev.yaml
http://localhost:8082

# when deployed with k8s
Not available
```
