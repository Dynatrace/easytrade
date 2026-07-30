package services

import (
	"fmt"
	"os"
	"time"

	pb "dynatrace.com/easytrade/pricing-service/proto"
	"dynatrace.com/easytrade/pricing-service/utils"
	log "github.com/sirupsen/logrus"
	"google.golang.org/grpc"
	"google.golang.org/grpc/connectivity"
	"google.golang.org/grpc/credentials/insecure"
)

var PricingClient pb.PricingServiceClient

func ConnectToDbAdapter() {
	conn, err := connectLoop(
		os.Getenv(utils.DbAdapterHostAndPort),
		utils.GetDuration(utils.ConnectTimeout, time.Minute),
		utils.GetDuration(utils.ConnectRetryWait, 5*time.Second),
	)
	if err != nil {
		log.Fatal(err)
	}
	PricingClient = pb.NewPricingServiceClient(conn)
	log.Info("Connected to db-adapter")
}

func connectLoop(hostAndPort string, timeout, retryWait time.Duration) (*grpc.ClientConn, error) {
	conn, err := grpc.NewClient(hostAndPort, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, fmt.Errorf("failed to create db-adapter client: %w", err)
	}

	ticker := time.NewTicker(retryWait)
	defer ticker.Stop()
	timeoutExceeded := time.After(timeout)

	conn.Connect()
	for {
		if conn.GetState() == connectivity.Ready {
			return conn, nil
		}
		select {
		case <-timeoutExceeded:
			return nil, fmt.Errorf("db-adapter not ready after %s", timeout)
		case <-ticker.C:
			log.Info("Connecting to db-adapter...")
			conn.Connect()
		}
	}
}
