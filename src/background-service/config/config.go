// Package config loads and validates the environment variables required by
// background-service, replacing four separate ad-hoc validation approaches:
// aggregator-service's optional-with-default env overrides, problem-operator's
// required-var checks, contentcreator's one-off MSSQL_CONNECTIONSTRING check,
// and third-party-service's completely unvalidated raw System.getenv calls
// (which used to fail with an NPE or NumberFormatException on first use
// instead of at startup).
package config

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

// VarSpec describes one environment variable this service depends on.
type VarSpec struct {
	Name     string
	Required bool
	Default  string
	// Validate runs only against a value that is actually present in the
	// environment. A non-nil error exits with a distinct status code from a
	// missing-but-required value, mirroring contentcreator's original
	// unset (exit 1) vs. empty (exit 2) distinction.
	Validate func(string) error
}

// Registry is the union of every environment variable read by any of the
// four merged services. aggregator's per-platform YAML config and
// problem-operator's POD_NAMESPACE k8s-presence gate are deliberately not
// listed here: the former isn't a flat env var, and the latter must never be
// globally required — see operator.Enabled().
var Registry = []VarSpec{
	// aggregator-service: offerservice base URL
	{Name: "OFFER_SERVICE_ADDRESS", Default: "http://offerservice:8080"},

	// third-party-service
	{Name: "CREDIT_CARD_ORDER_SERVICE_ADDRESS", Required: true},
	{Name: "COURIER_DELAY", Required: true},
	{Name: "COURIER_RATE", Required: true},
	{Name: "MANUFACTURE_DELAY", Required: true},
	{Name: "MANUFACTURE_RATE", Required: true},

	// contentcreator
	{Name: "MSSQL_CONNECTIONSTRING", Required: true, Validate: nonEmpty},

	// shared by problem-operator's high_cpu_usage controller and thirdparty's factory_crisis check
	{Name: "FEATURE_FLAG_SERVICE_PROTOCOL", Required: true},
	{Name: "FEATURE_FLAG_SERVICE_BASE_URL", Required: true},
	{Name: "FEATURE_FLAG_SERVICE_PORT", Required: true},

	// problem-operator, only consulted when operator.Enabled() is true
	{Name: "SYNC_INTERVAL", Default: "5s"},
}

func nonEmpty(v string) error {
	if v == "" {
		return fmt.Errorf("value must not be empty")
	}
	return nil
}

// LoadLocalEnv loads a .env file for local development, if one is present.
func LoadLocalEnv() {
	fmt.Println("Loading env vars from .env file!")
	_ = godotenv.Load()
}

// Values holds every resolved (environment-or-default) variable value.
type Values map[string]string

// CheckEnv validates Registry against the process environment and returns
// the resolved values. A missing required variable exits with status 1; a
// present-but-invalid value exits with status 2.
func CheckEnv() Values {
	values := make(Values, len(Registry))

	for _, spec := range Registry {
		v, found := os.LookupEnv(spec.Name)
		switch {
		case found:
			if spec.Validate != nil {
				if err := spec.Validate(v); err != nil {
					fmt.Printf("Environment variable %s is invalid: %s\n", spec.Name, err)
					os.Exit(2)
				}
			}
			values[spec.Name] = v
		case spec.Required:
			// deepcode ignore ClearTextLogging: only environment variable name
			fmt.Println("Please set", spec.Name, "environment variable")
			os.Exit(1)
		default:
			values[spec.Name] = spec.Default
		}
	}

	return values
}

// Get returns the resolved value for name, or "" if it was never registered.
func (v Values) Get(name string) string { return v[name] }

// MustDuration parses the resolved value for name as a time.Duration,
// exiting with status 2 on a parse failure.
func (v Values) MustDuration(name string) time.Duration {
	d, err := time.ParseDuration(v[name])
	if err != nil {
		fmt.Printf("Environment variable %s is not a valid duration: %s\n", name, err)
		os.Exit(2)
	}
	return d
}

// MustInt parses the resolved value for name as an int, exiting with status
// 2 on a parse failure.
func (v Values) MustInt(name string) int {
	n, err := strconv.Atoi(v[name])
	if err != nil {
		fmt.Printf("Environment variable %s is not a valid integer: %s\n", name, err)
		os.Exit(2)
	}
	return n
}
