package featureflag

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"

	"go.uber.org/zap"
)

const (
	serviceProtocolEnv = "FEATURE_FLAG_SERVICE_PROTOCOL"
	serviceBaseURLEnv  = "FEATURE_FLAG_SERVICE_BASE_URL"
	servicePortEnv     = "FEATURE_FLAG_SERVICE_PORT"
)

var (
	ErrEnvironmentVariableNotFound = errors.New("environment variable not found")
	ErrUnexpectedStatusCode        = errors.New("received unexpected response status code")
)

type ServiceConnector struct {
	logger   *zap.SugaredLogger
	protocol string
	baseURL  string
	port     int
}

func NewServiceConnector(l *zap.SugaredLogger, protocol string, baseURL string, port int) *ServiceConnector {
	return &ServiceConnector{logger: l, protocol: protocol, baseURL: baseURL, port: port}
}

func NewServiceConnectorFromEnv(logger *zap.SugaredLogger) (*ServiceConnector, error) {
	protocol, found := os.LookupEnv(serviceProtocolEnv)
	if !found {
		return nil, fmt.Errorf("%s not found: %w", serviceProtocolEnv, ErrEnvironmentVariableNotFound)
	}

	baseURL, found := os.LookupEnv(serviceBaseURLEnv)
	if !found {
		return nil, fmt.Errorf("%s not found: %w", serviceBaseURLEnv, ErrEnvironmentVariableNotFound)
	}

	portStr, found := os.LookupEnv(servicePortEnv)
	if !found {
		return nil, fmt.Errorf("%s not found: %w", servicePortEnv, ErrEnvironmentVariableNotFound)
	}

	port, err := strconv.Atoi(portStr)
	if err != nil {
		return nil, fmt.Errorf("can't parse %s to port number: %w", portStr, err)
	}

	return NewServiceConnector(logger, protocol, baseURL, port), nil
}

func (c *ServiceConnector) GetFlags(ctx context.Context) ([]FeatureFlag, error) {
	c.logger.Debug("Fetching all flags")

	url := fmt.Sprintf("%s://%s:%d/v1/flags", c.protocol, c.baseURL, c.port)

	flagResults, err := fetchData[featureFlagResults](ctx, url)
	if err != nil {
		c.logger.Error("Fetching flags failed")

		return nil, fmt.Errorf("unable to get the flags: %w", err)
	}

	return flagResults.Results, nil
}

func (c *ServiceConnector) GetFlag(ctx context.Context, flagName string) (*FeatureFlag, error) {
	c.logger.Debugw("Fetching a flag", "flag", flagName)

	url := fmt.Sprintf("%s://%s:%d/v1/flags/%s", c.protocol, c.baseURL, c.port, flagName)

	flag, err := fetchData[FeatureFlag](ctx, url)
	if err != nil {
		c.logger.Errorw("Fetching the flag failed", "flag", flagName)

		return nil, fmt.Errorf("unable to get the %s flag: %w", flagName, err)
	}

	return flag, nil
}

func fetchData[T any](ctx context.Context, url string) (*T, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create a request: %w", err)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error while fetching the response: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("expected status 200 OK, got %d %s: %w", resp.StatusCode, resp.Status, ErrUnexpectedStatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	var result T

	err = json.Unmarshal(body, &result)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal response body to json: %w", err)
	}

	return &result, nil
}
