package aggregator

import (
	"os"
	"time"

	"dynatrace.com/easytrade/background-service/config"
	"gopkg.in/yaml.v3"
)

type PlatformConfig struct {
	Name                 string        `yaml:"name"`
	Filter               string        `yaml:"filter"`
	MaxFee               float32       `yaml:"maxFee"`
	Delay                time.Duration `yaml:"delay"`
	FailDelay            time.Duration `yaml:"failDelay"`
	SignupInterval       time.Duration `yaml:"signupInterval"`
	RequestTimeLimit     time.Duration `yaml:"requestTimeLimit"`
	ConsecutiveFailLimit int           `yaml:"consecutiveFailLimit"`
}

type PackageProbability struct {
	Starter float32 `yaml:"starter"`
	Light   float32 `yaml:"light"`
	Pro     float32 `yaml:"pro"`
}

type PlatformEntry struct {
	PlatformConfig     `yaml:",inline"`
	PackageProbability PackageProbability `yaml:"packageProbability"`
}

type yamlConfig struct {
	Defaults struct {
		Delay                time.Duration `yaml:"delay"`
		FailDelay            time.Duration `yaml:"failDelay"`
		RequestTimeLimit     time.Duration `yaml:"requestTimeLimit"`
		SignupInterval       time.Duration `yaml:"signupInterval"`
		ConsecutiveFailLimit int           `yaml:"consecutiveFailLimit"`
	} `yaml:"defaults"`

	Platforms []PlatformEntry `yaml:"platforms"`
}

type Config struct {
	OfferServiceAddress string
	Platforms           []PlatformEntry
}

const defaultConfigPath = "config.yaml"

func LoadConfig(values config.Values) (*Config, error) {
	path := os.Getenv("AGGREGATOR_CONFIG_PATH")
	if path == "" {
		path = defaultConfigPath
	}

	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var yc yamlConfig
	if err := yaml.NewDecoder(file).Decode(&yc); err != nil {
		return nil, err
	}

	for i := range yc.Platforms {
		p := &yc.Platforms[i]
		if p.Delay == 0 {
			p.Delay = yc.Defaults.Delay
		}
		if p.FailDelay == 0 {
			p.FailDelay = yc.Defaults.FailDelay
		}
		if p.RequestTimeLimit == 0 {
			p.RequestTimeLimit = yc.Defaults.RequestTimeLimit
		}
		if p.SignupInterval == 0 {
			p.SignupInterval = yc.Defaults.SignupInterval
		}
		if p.ConsecutiveFailLimit == 0 {
			p.ConsecutiveFailLimit = yc.Defaults.ConsecutiveFailLimit
		}
	}

	return &Config{
		OfferServiceAddress: values.Get("OFFER_SERVICE_ADDRESS"),
		Platforms:           yc.Platforms,
	}, nil
}
