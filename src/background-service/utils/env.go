package utils

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

const (
	creditCardOrderServiceAddress = "CREDIT_CARD_ORDER_SERVICE_ADDRESS"
	courierDelay                  = "COURIER_DELAY"
	courierRate                   = "COURIER_RATE"

	manufactureDelay = "MANUFACTURE_DELAY"
	manufactureRate  = "MANUFACTURE_RATE"

	offerServiceAddress = "OFFER_SERVICE_ADDRESS"
)

func LoadLocalEnv() {
	fmt.Println("Loading env vars from .env file!")
	godotenv.Load()
}

func CheckEnv() {
	checkSingleEnv(creditCardOrderServiceAddress)
	checkSingleEnv(courierDelay)
	checkSingleEnv(courierRate)
	checkSingleEnv(manufactureDelay)
	checkSingleEnv(manufactureRate)

	checkSingleEnv(offerServiceAddress)
}

func checkSingleEnv(envName string) {
	if _, ok := os.LookupEnv(envName); !ok {
		// deepcode ignore ClearTextLogging: only environment variable name
		fmt.Println("Please set", envName, "environment variable")
		os.Exit(1)
	}
}
