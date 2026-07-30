package main

import (
	"os"

	"dynatrace.com/easytrade/pricing-service/services"
	"dynatrace.com/easytrade/pricing-service/utils"
)

func init() {
	if _, ok := os.LookupEnv(utils.GinMode); !ok {
		utils.LoadLocalEnv()
	}

	utils.CheckEnv()
	services.ConnectToDbAdapter()
}

func main() {
	router := CreateRouter()
	router.Run()
}
