package utils

import (
	"fmt"
	"os"
	"time"

	"github.com/joho/godotenv"
)

func LoadLocalEnv() {
	fmt.Println("Loading env vars from .env file!")
	godotenv.Load()
}

func CheckEnv() {
	checkSingleEnv(DbAdapterHostAndPort)
}

func checkSingleEnv(envName string) {
	if _, ok := os.LookupEnv(envName); !ok {
		fmt.Println("Please set", envName, "environment variable")
		os.Exit(1)
	}
}
func GetDuration(key string, defaultValue time.Duration) time.Duration {
	value, exists := os.LookupEnv(key)
	if !exists {
		return defaultValue
	}
	d, err := time.ParseDuration(value)
	if err != nil {
		return defaultValue
	}
	return d
}
