package main

import (
	"fmt"
	"os"

	"dynatrace.com/easytrade/user-service/account"
	"dynatrace.com/easytrade/user-service/dbadapter"
	"dynatrace.com/easytrade/user-service/utils"
)

func init() {
	if _, ok := os.LookupEnv(utils.GinMode); !ok {
		utils.LoadLocalEnv()
	}

	utils.CheckEnv()
}

func main() {
	baseURL, err := utils.ParseAddress(os.Getenv(utils.DbAdapterAddress))
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	db := dbadapter.NewRestAdapter(baseURL)
	handler := account.NewHandler(db)

	router := CreateRouter(handler)
	router.Run()
}
