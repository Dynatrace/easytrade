#!/bin/bash

until timeout 1 bash -c "cat < /dev/null > /dev/tcp/${RABBITMQ_HOST}/${RABBITMQ_PORT}"; do
  >&2 echo "Waiting for Rabbit MQ on ${RABBITMQ_HOST}:${RABBITMQ_PORT}..."
  sleep 1
done

echo "Rabbit MQ is up!"

./consumeCandleData