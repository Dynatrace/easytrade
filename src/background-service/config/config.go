package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type VarSpec struct {
	Name     string
	Required bool
	Default  string
}

var Registry = []VarSpec{
	// aggregator-service
	{Name: "OFFER_SERVICE_ADDRESS", Required: true},

	// third-party-service
	{Name: "CREDIT_CARD_ORDER_SERVICE_ADDRESS", Required: true},
	{Name: "THIRD_PARTY_DELAY", Default: "10"},
	{Name: "THIRD_PARTY_RATE", Default: "10"},
	{Name: "DELAY_CHANCE_PERCENT", Default: "20"},

	// contentcreator
	{Name: "DB_ADAPTER_SERVICE_ADDRESS", Required: true},

	// problem-operator
	{Name: "FEATURE_FLAG_SERVICE_ADDRESS", Required: true},

	// problem-operator, only consulted when operator.Enabled() is true
	{Name: "SYNC_INTERVAL", Default: "5s"},
}

func LoadLocalEnv() {
	fmt.Println("Loading env vars from .env file!")
	godotenv.Load()
}

type Values map[string]string

func CheckEnv() Values {
	values := make(Values, len(Registry))

	for _, spec := range Registry {
		v, found := os.LookupEnv(spec.Name)
		switch {
		case found:
			values[spec.Name] = v
		case spec.Default != "":
			values[spec.Name] = spec.Default
		case spec.Required:
			fmt.Println("Please set", spec.Name, "environment variable")
			os.Exit(1)
		default:
			values[spec.Name] = spec.Default
		}
	}

	return values
}

func (v Values) Get(name string) string { return v[name] }

func (v Values) MustInt(name string) int {
	n, err := strconv.Atoi(v[name])
	if err != nil {
		fmt.Printf("Environment variable %s is not a valid integer: %s\n", name, err)
		os.Exit(2)
	}
	return n
}
