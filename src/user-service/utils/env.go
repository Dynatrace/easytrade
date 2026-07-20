package utils

import (
	"fmt"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

func LoadLocalEnv() {
	fmt.Println("Loading env vars from .env file!")
	godotenv.Load()
}

func CheckEnv() {
	checkSingleEnv(DbAdapterAddress)
}

func checkSingleEnv(envName string) {
	if _, ok := os.LookupEnv(envName); !ok {
		// deepcode ignore ClearTextLogging: only environment variable name
		fmt.Println("Please set", envName, "environment variable")
		os.Exit(1)
	}
}

// ParseAddress converts a "protocol|host|port" value into a base URL string "protocol://host:port".
func ParseAddress(raw string) (string, error) {
	parts := strings.SplitN(raw, "|", 3)
	if len(parts) != 3 {
		return "", fmt.Errorf("invalid address format %q: expected protocol|host|port", raw)
	}
	return fmt.Sprintf("%s://%s:%s", parts[0], parts[1], parts[2]), nil
}
