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
	router := CreateRouter(price.NewHandler(newDbAdapterClient()))
	router.Run()
}

func newDbAdapterClient() pb.PricingServiceClient {
	conn, err := grpc.NewClient(
		os.Getenv(utils.DbAdapterHostAndPort),
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	return pb.NewPricingServiceClient(conn)
}
