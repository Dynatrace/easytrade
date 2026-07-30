package aggregator

import (
	"time"

	"dynatrace.com/easytrade/background-service/config"
)

type PlatformConfig struct {
	Name                 string
	Filter               string
	MaxFee               float32
	Delay                time.Duration
	FailDelay            time.Duration
	SignupInterval       time.Duration
	RequestTimeLimit     time.Duration
	ConsecutiveFailLimit int
}

type PackageProbability struct {
	Starter float32
	Light   float32
	Pro     float32
}

type PlatformEntry struct {
	PlatformConfig
	PackageProbability PackageProbability
}

type Config struct {
	OfferServiceAddress string
	Platforms           []PlatformEntry
}

const (
	defaultDelay                = 3 * time.Second
	defaultFailDelay            = 15 * time.Minute
	defaultRequestTimeLimit     = time.Second
	defaultSignupInterval       = time.Hour
	defaultConsecutiveFailLimit = 50
)

func newPlatform(name, filter string, packageProbability PackageProbability) PlatformEntry {
	return PlatformEntry{
		PlatformConfig: PlatformConfig{
			Name:                 name,
			Filter:               filter,
			Delay:                defaultDelay,
			FailDelay:            defaultFailDelay,
			RequestTimeLimit:     defaultRequestTimeLimit,
			SignupInterval:       defaultSignupInterval,
			ConsecutiveFailLimit: defaultConsecutiveFailLimit,
		},
		PackageProbability: packageProbability,
	}
}

var platforms = []PlatformEntry{
	newPlatform("dynatestsieger.at", "", PackageProbability{Starter: 0.6, Light: 0.3, Pro: 0.1}),
	newPlatform("tradeCom.co.uk", "", PackageProbability{Starter: 0.8, Light: 0.2, Pro: 0}),
	newPlatform("CryptoTrading.com", `["Crypto"]`, PackageProbability{Starter: 0.5, Light: 0.4, Pro: 0.1}),
	newPlatform("CheapTrading.mi", "", PackageProbability{Starter: 1, Light: 0, Pro: 0}),
	newPlatform("Stratton-oakmount.com", `["Shares"]`, PackageProbability{Starter: 0, Light: 0.1, Pro: 0.9}),
}

func LoadConfig(values config.Values) *Config {
	return &Config{
		OfferServiceAddress: values.Get("OFFER_SERVICE_ADDRESS"),
		Platforms:           platforms,
	}
}
