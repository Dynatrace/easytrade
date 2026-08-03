package aggregator

import (
	"dynatrace.com/easytrade/background-service/config"
)

type PlatformConfig struct {
	Name               string
	Filter             string
	MaxFee             float32
	PackageProbability PackageProbability
}

type PackageProbability struct {
	Starter float32
	Light   float32
	Pro     float32
}
type Config struct {
	OfferServiceAddress string
	Platforms           []PlatformConfig
}

var platforms = []PlatformConfig{
	{
		Name:               "dynatestsieger.at",
		Filter:             "",
		PackageProbability: PackageProbability{Starter: 0.6, Light: 0.3, Pro: 0.1},
	},
	{
		Name:               "tradeCom.co.uk",
		Filter:             "",
		PackageProbability: PackageProbability{Starter: 0.8, Light: 0.2, Pro: 0},
	},
	{
		Name:               "CryptoTrading.com",
		Filter:             `["Crypto"]`,
		PackageProbability: PackageProbability{Starter: 0.5, Light: 0.4, Pro: 0.1},
	},
	{
		Name:               "CheapTrading.mi",
		Filter:             "",
		PackageProbability: PackageProbability{Starter: 1, Light: 0, Pro: 0},
	},
	{
		Name:               "Stratton-oakmount.com",
		Filter:             `["Shares"]`,
		PackageProbability: PackageProbability{Starter: 0, Light: 0.1, Pro: 0.9},
	},
}

func LoadConfig(values config.Values) *Config {
	return &Config{
		OfferServiceAddress: values.Get("OFFER_SERVICE_ADDRESS"),
		Platforms:           platforms,
	}
}
