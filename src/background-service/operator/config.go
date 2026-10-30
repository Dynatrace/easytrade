package operator

import (
	"fmt"
	"os"
	"time"

	"go.uber.org/zap"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"

	"dynatrace.com/easytrade/background-service/featureflag"
)

const (
	syncIntervalEnv = "SYNC_INTERVAL"
	defaultInterval = 5 * time.Second

	brokerService        = "broker-service"
	brokerServiceNameEnv = "HIGH_CPU_USAGE_BROKER_SERVICE_NAME"

	flagName = "high_cpu_usage"

	cpuLimitEnv     = "HIGH_CPU_USAGE_BROKER_SERVICE_CPU_LIMIT"
	cpuLimitDefault = "300m"
)

var ErrNamespaceEnvNotFound = fmt.Errorf("pod namespace not found in the %s environment variable", podNamespaceEnv)

type Config struct {
	Logger      *zap.SugaredLogger
	Client      kubernetes.Interface
	FlagService featureflag.FlagService
	Namespace   string
	Interval    time.Duration
	CPULimit    string
	// BrokerServiceName is the name of the broker-service Deployment, which
	// carries the Helm release prefix in Kubernetes (e.g. "easytrade-broker-service").
	BrokerServiceName string
}

func (c Config) Build() *Operator {
	if c.Interval <= 0 {
		c.Interval = defaultInterval
	}
	if c.CPULimit == "" {
		c.CPULimit = cpuLimitDefault
	}
	if c.BrokerServiceName == "" {
		c.BrokerServiceName = brokerService
	}

	return New(c.Logger, c.Client, c.FlagService, c.Namespace, c.Interval, c.CPULimit, c.BrokerServiceName)
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

func (c *Config) loadBrokerServiceNameFromEnv() {
	c.BrokerServiceName = os.Getenv(brokerServiceNameEnv)
}

func NewDefaultConfig(logger *zap.SugaredLogger, flagService featureflag.FlagService) (*Config, error) {
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
	config.loadBrokerServiceNameFromEnv()

	return config, nil
}
