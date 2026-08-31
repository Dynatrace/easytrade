package main

import (
	"fmt"
	"os"

	"dynatrace.com/easytrade/pricing-service/price"
	pb "dynatrace.com/easytrade/pricing-service/proto"
	"dynatrace.com/easytrade/pricing-service/utils"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func init() {
	if _, ok := os.LookupEnv(utils.GinMode); !ok {
		utils.LoadLocalEnv()
	}

	utils.CheckEnv()
}

func main() {
	conn := newDbAdapterConn()

	router := CreateRouter(price.NewHandler(pb.NewPricingServiceClient(conn)))
	setupHealth(router, conn)

	appAddr := fmt.Sprintf(":%s", os.Getenv(utils.HealthPort))
	router.Run(appAddr)
}

func newDbAdapterConn() *grpc.ClientConn {
	conn, err := grpc.NewClient(
		os.Getenv(utils.DbAdapterHostAndPort),
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	return conn
}
