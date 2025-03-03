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
	services.ConnectToDB()
}

//	@title			Pricing service API
//	@version		1.0
//	@description	This service provides information about the prices of instruments being handled by easyTrade.
//	@termsOfService	http://swagger.io/terms/

//	@license.name	Apache 2.0
//	@license.url	http://www.apache.org/licenses/LICENSE-2.0.html

// @schemes	http
func main() {
	router := CreateRouter()
	router.Run()
}
