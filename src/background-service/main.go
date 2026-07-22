package main

import (
	"dynatrace.com/easytrade/background-service/utils"
)

func main() {
	utils.LoadLocalEnv()
	utils.CheckEnv()
}
