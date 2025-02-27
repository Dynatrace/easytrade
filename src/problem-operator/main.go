package main

import (
	"context"

	"dynatrace.com/easytrade/problem-operator/controllers/highcpuusage"
	"dynatrace.com/easytrade/problem-operator/featureflag"
	"dynatrace.com/easytrade/problem-operator/operator"
	"go.uber.org/zap"
)

func main() {
	zapConfig := zap.NewDevelopmentConfig()
	zapConfig.DisableStacktrace = true
	logger := zap.Must(zapConfig.Build()).Sugar()
	defer logger.Sync()

	flagService := operator.Must(featureflag.NewServiceConnectorFromEnv(logger.Named("Feature flag")))

	operator := operator.Must(operator.NewDefaultConfig(logger.Named("Operator"), flagService)).Build()
	defer operator.Shutdown()

	operator.RegisterController(highcpuusage.NewBrokerController(logger.Named("High CPU Usage | Broker Service")))

	operator.Run(context.Background())
}
