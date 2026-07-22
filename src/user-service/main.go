package main

import (
	"fmt"
	"os"

	"dynatrace.com/easytrade/user-service/account"
	"dynatrace.com/easytrade/user-service/dbadapter/proto"
	"dynatrace.com/easytrade/user-service/utils"
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
	addr := os.Getenv(utils.DbAdapterAddress)

	conn, err := grpc.NewClient(addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}

	client := proto.NewAccountServiceClient(conn)
	handler := account.NewHandler(client)

	router := CreateRouter(handler)
	router.Run()
}
