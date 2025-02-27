package utils

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

func LoadLocalEnv() {
	fmt.Println("Loading env vars from .env file!")
	godotenv.Load()
}

func CheckEnv() {
	checkSingleEnv(RabbitmqHost)
	checkSingleEnv(RabbitmqUser)
	checkSingleEnv(RabbitmqPassword)
	checkSingleEnv(RabbitmqQueueName)
	checkSingleEnv(MssqlConnectionString)
}

func checkSingleEnv(envName string) {
	if _, ok := os.LookupEnv(envName); !ok {
		// deepcode ignore ClearTextLogging: only environment variable name
		fmt.Println("Please set", envName, "environment variable")
		os.Exit(1)
	}
}
