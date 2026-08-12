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
	// MssqlConnectionString is not required anymore since db-adapter feature but I am leaving it
	// for now to avoid breaking existing deployments as this refactor is not the scope of this PR. 
	// It will be replaced with db-adapter env vars in the future.
	if _, ok := os.LookupEnv(MssqlConnectionString); !ok {
		fmt.Println("Please set", MssqlConnectionString, "environment variable")
		os.Exit(1)
	}
}
