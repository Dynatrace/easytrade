package main

import (
	"os"

	"dynatrace.com/easytrade/user-service/services"
	"dynatrace.com/easytrade/user-service/utils"
)

func init() {
	if _, ok := os.LookupEnv(utils.GinMode); !ok {
		utils.LoadLocalEnv()
	}

	utils.CheckEnv()
	services.ConnectToDB()
}

func main() {
	router := CreateRouter()
	router.Run()
}
