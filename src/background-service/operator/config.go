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
	syncIntervalEnv = "SYNC_INTERVAL"
	defaultInterval = 5 * time.Second

	brokerService = "broker-service"

	flagName = "high_cpu_usage"

	cpuLimitEnv     = "HIGH_CPU_USAGE_BROKER_SERVICE_CPU_LIMIT"
	cpuLimitDefault = "300m"
)

var ErrNamespaceEnvNotFound = fmt.Errorf("pod namespace not found in the %s environment variable", podNamespaceEnv)

type Config struct {
	Logger      *zap.SugaredLogger
	Client      kubernetes.Interface
	FlagService FlagService
	Namespace   string
	Interval    time.Duration
	CPULimit    string
}

func (c Config) Build() *Operator {
	if c.Interval <= 0 {
		c.Interval = defaultInterval
	}
	if c.CPULimit == "" {
		c.CPULimit = cpuLimitDefault
	}

	return New(c.Logger, c.Client, c.FlagService, c.Namespace, c.Interval, c.CPULimit)
}

func (c *Config) loadInClusterConfig() error {
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

func (c *Config) loadNamespaceFromEnv() error {
	namespace, found := os.LookupEnv(podNamespaceEnv)
	if !found {
		return ErrNamespaceEnvNotFound
	}

	c.Namespace = namespace

	return nil
}

func (c *Config) loadIntervalFromEnv() error {
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

func (c *Config) loadCPULimitFromEnv() {
	c.CPULimit = os.Getenv(cpuLimitEnv)
}

func NewDefaultConfig(logger *zap.SugaredLogger, flagService FlagService) (*Config, error) {
	config := &Config{Logger: logger, FlagService: flagService}

	if err := config.loadInClusterConfig(); err != nil {
		return nil, err
	}
	if err := config.loadNamespaceFromEnv(); err != nil {
		return nil, err
	}
	if err := config.loadIntervalFromEnv(); err != nil {
		return nil, err
	}

	config.loadCPULimitFromEnv()

	return config, nil
}
