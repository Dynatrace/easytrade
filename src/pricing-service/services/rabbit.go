package services

import (
	"context"
	"fmt"
	"os"
	"time"

	"dynatrace.com/easytrade/pricing-service/utils"
	amqp "github.com/rabbitmq/amqp091-go"

	log "github.com/sirupsen/logrus"
)

func SendDataToRabbitQueue(msgBody string) {
	connection := createConnection()
	defer connection.Close()

	channel, err := connection.Channel()
	failOnError(err, "Failed to open a channel")
	defer channel.Close()

	queue := createQueue(channel, os.Getenv(utils.RabbitmqQueueName))

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	sendMessage(msgBody, channel, ctx, queue.Name)

	log.Info("Data pushed to RabbitMQ queue.")
}

func createConnection() *amqp.Connection {
	connection, err := amqp.Dial(fmt.Sprintf(
		"amqp://%s:%s@%s:5672/",
		os.Getenv(utils.RabbitmqUser),
		os.Getenv(utils.RabbitmqPassword),
		os.Getenv(utils.RabbitmqHost),
	))
	failOnError(err, "Failed to connect to RabbitMQ")

	return connection
}

func createQueue(channel *amqp.Channel, queueName string) amqp.Queue {
	queue, err := channel.QueueDeclare(
		queueName, // name
		true,      // durable
		false,     // delete when unused
		false,     // exclusive
		false,     // no-wait
		nil,       // arguments
	)
	failOnError(err, "Failed to declare a queue")

	return queue
}

func sendMessage(msgBody string, channel *amqp.Channel, ctx context.Context, queueName string) {
	err := channel.PublishWithContext(
		ctx,
		"",        // exchange
		queueName, // routing key
		false,     // mandatory
		false,     // immediate
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        []byte(msgBody),
		},
	)
	failOnError(err, "Failed to publish a message")
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}
