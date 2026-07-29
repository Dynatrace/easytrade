package config

import (
	"os"
	"time"
)

type Config struct {
	Database DatabaseConfig
	Server   ServerConfig
}

type DatabaseConfig struct {
	Type           string
	Url            string
	ConnectTimeout time.Duration
	RetryInterval  time.Duration
}

type ServerConfig struct {
	GRPCPort string
}

func Load() *Config {
	return &Config{
		Database: DatabaseConfig{
			Type:           getEnv("DB_TYPE", "mssql"),
			Url:            getEnv("DB_URL", ""),
			ConnectTimeout: getDuration("DB_CONNECT_TIMEOUT", 5*time.Minute),
			RetryInterval:  getDuration("DB_RETRY_INTERVAL", 10*time.Second),
		},
		Server: ServerConfig{
			GRPCPort: getEnv("GRPC_PORT", "50051"),
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func getDuration(key string, defaultValue time.Duration) time.Duration {
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
