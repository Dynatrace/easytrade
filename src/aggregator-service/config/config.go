package config

import (
	"flag"
	"os"
	"time"

	"dynatrace.com/easytrade/aggregator-service/logger"
	"gopkg.in/yaml.v3"
)

type OfferServiceConfig struct {
	Protocol string `yaml:"protocol"`
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
}

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

type Config struct {
	OfferServiceConfig OfferServiceConfig `yaml:"offerservice"`

	Defaults struct {
		Delay                time.Duration `yaml:"delay"`
		FailDelay            time.Duration `yaml:"failDelay"`
		RequestTimeLimit     time.Duration `yaml:"requestTimeLimit"`
		SignupInterval       time.Duration `yaml:"signupInterval"`
		ConsecutiveFailLimit int           `yaml:"consecutiveFailLimit"`
	} `yaml:"defaults"`

	PlatformConfigs []struct {
		PlatformConfig     `yaml:",inline"`
		PackageProbability PackageProbability `yaml:"packageProbability"`
	} `yaml:"platforms"`
}

func (c *Config) setDefaultValues() {
	for i := range c.PlatformConfigs {
		p := &c.PlatformConfigs[i]
		if p.Delay == 0 {
			p.Delay = c.Defaults.Delay
		}
		if p.FailDelay == 0 {
			p.FailDelay = c.Defaults.FailDelay
		}
		if p.RequestTimeLimit == 0 {
			p.RequestTimeLimit = c.Defaults.RequestTimeLimit
		}
		if p.SignupInterval == 0 {
			p.SignupInterval = c.Defaults.SignupInterval
		}
		if p.ConsecutiveFailLimit == 0 {
			p.ConsecutiveFailLimit = c.Defaults.ConsecutiveFailLimit
		}
	}
}

func LoadConfig() (*Config, error) {
	l := logger.GetSugar()
	var configPath string

	flag.StringVar(&configPath, "config", "./config.yaml", "Configuration file path")
	flag.Parse()

	config, err := newConfig(configPath)
	if err != nil {
		l.Errorw(err.Error(), "configPath", configPath)
		return nil, err
	}

	config.setDefaultValues()
	config.OfferServiceConfig.loadEnvironmentVariables()

	l.Infof("Successfully loaded configuration from %s, found %d platforms", configPath, len(config.PlatformConfigs))
	return config, err
}

func newConfig(configPath string) (*Config, error) {
	config := &Config{}

	file, err := os.Open(configPath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	d := yaml.NewDecoder(file)
	err = d.Decode(&config)
	if err != nil {
		return nil, err
	}
	return config, nil
}
