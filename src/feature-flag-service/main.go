package main

import (
	"log"
	"os"
	"strconv"

	"dynatrace.com/easytrade/feature-flag-service/flag"
)

func getEnvBool(key string, defaultVal bool) bool {
	val := os.Getenv(key)
	if val == "" {
		return defaultVal
	}
	b, err := strconv.ParseBool(val)
	if err != nil {
		return defaultVal
	}
	return b
}

func initFlags() map[string]*flag.Flag {
	enableModify := getEnvBool("ENABLE_MODIFY", true)
	return map[string]*flag.Flag{
		"frontend_feature_flag_management": {
			ID:           "frontend_feature_flag_management",
			Enabled:      getEnvBool("ENABLE_FRONTEND_MODIFY", true),
			Name:         "Frontend feature flag management",
			Description:  "When enabled allows controlling problem pattern feature flags from the main app UI.",
			IsModifiable: false,
			Tag:          "config",
		},
		"db_not_responding": {
			ID:           "db_not_responding",
			Enabled:      getEnvBool("ENABLE_DB_NOT_RESPONDING", false),
			Name:         "DB not responding",
			Description:  "When enabled, the DB not responding will be simulated, this will cause errors when trying to create any new transactions.",
			IsModifiable: enableModify,
			Tag:          "problem_pattern",
		},
		"ergo_aggregator_slowdown": {
			ID:           "ergo_aggregator_slowdown",
			Enabled:      getEnvBool("ENABLE_ERGO_AGGREGATOR_SLOWDOWN", false),
			Name:         "Ergo aggregator slowdown",
			Description:  "When enabled, the OfferService will respond with delay to 2 out of 5 AggregatorServices querying it, which will result in those services pausing the queries for 1h.",
			IsModifiable: enableModify,
			Tag:          "problem_pattern",
		},
		"factory_crisis": {
			ID:           "factory_crisis",
			Enabled:      getEnvBool("ENABLE_FACTORY_CRISIS", false),
			Name:         "Factory crisis",
			Description:  "When enabled, the factory won't produce new cards, which will cause the Third party service not to process credit card orders.",
			IsModifiable: enableModify,
			Tag:          "problem_pattern",
		},
		"credit_card_meltdown": {
			ID:           "credit_card_meltdown",
			Enabled:      getEnvBool("ENABLE_CREDIT_CARD_MELTDOWN", false),
			Name:         "OrderController service error",
			Description:  "When enabled, then checking latest status will result in a division by 0 error. This results in visits to the Credit Card frontend tab resulting in an ugly error page.",
			IsModifiable: enableModify,
			Tag:          "problem_pattern",
		},
		"high_cpu_usage": {
			ID:           "high_cpu_usage",
			Enabled:      getEnvBool("ENABLE_HIGH_CPU_USAGE", false),
			Name:         "K8s: high CPU usage",
			Description:  "Causes a slowdown of broker-service response time and increases CPU usage during that time. If the app is deployed on K8s, a CPU resource limit is also applied.",
			IsModifiable: enableModify,
			Tag:          "problem_pattern",
		},
		"credit_card_validation": {
			ID:           "credit_card_validation",
			Enabled:      getEnvBool("ENABLE_CREDIT_CARD_VALIDATION", false),
			Name:         "Credit card validation",
			Description:  "When enabled, credit card numbers are validated via the mainframe before deposit/withdraw operations are processed. Requires MAINFRAME_SERVICE_URL to be configured in broker-service.",
			IsModifiable: enableModify,
			Tag:          "problem_pattern",
		},
	}
}

func main() {
	svc := flag.NewService(initFlags())
	r := CreateRouter(svc)
	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
