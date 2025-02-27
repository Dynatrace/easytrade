package operator

import (
	"fmt"
	"os"
	"time"

	"go.uber.org/zap"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

const (
	podNamespaceEnv = "POD_NAMESPACE"

	syncIntervalEnv = "SYNC_INTERVAL"
	defaultInterval = 5 * time.Second
)

var ErrNamespaceEnvNotFound = fmt.Errorf("pod namespace not found in the %s environment variable", podNamespaceEnv)

type Config struct {
	Logger      *zap.SugaredLogger
	Client      kubernetes.Interface
	FlagService FlagService
	Namespace   string
	Interval    time.Duration
}

func (c Config) Build() *Operator {
	if c.Interval <= 0 {
		c.Interval = defaultInterval
	}

	return New(c.Logger, c.Client, c.FlagService, c.Namespace, c.Interval)
}

func (c *Config) LoadInClusterConfig() error {
	clusterConfig, err := rest.InClusterConfig()
	if err != nil {
		return fmt.Errorf("failed to load in-cluster config: %w", err)
	}

	client, err := kubernetes.NewForConfig(clusterConfig)
	if err != nil {
		return fmt.Errorf("failed to create a client: %w", err)
	}

	c.Client = client

	return nil
}

func (c *Config) LoadNamespaceFromEnv() error {
	namespace, found := os.LookupEnv(podNamespaceEnv)
	if !found {
		return ErrNamespaceEnvNotFound
	}

	c.Namespace = namespace

	return nil
}

func (c *Config) LoadIntervalFromEnv() error {
	interval := defaultInterval

	if intervalStr, found := os.LookupEnv(syncIntervalEnv); found {
		var err error

		interval, err = time.ParseDuration(intervalStr)
		if err != nil {
			return fmt.Errorf("failed to parse interval duration: %w", err)
		}
	}

	c.Interval = interval

	return nil
}

func NewDefaultConfig(logger *zap.SugaredLogger, flagService FlagService) (*Config, error) {
	config := &Config{Logger: logger, FlagService: flagService}

	err := config.LoadInClusterConfig()
	if err != nil {
		return nil, err
	}

	err = config.LoadNamespaceFromEnv()
	if err != nil {
		return nil, err
	}

	err = config.LoadIntervalFromEnv()
	if err != nil {
		return nil, err
	}

	return config, nil
}

func Must[T any](obj T, err error) T {
	if err != nil {
		panic(err)
	}

	return obj
}
