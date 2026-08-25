package main

import (
	"context"
	"github.com/open-feature/go-sdk/openfeature"
	"os/signal"
	"syscall"

	"dynatrace.com/easytrade/background-service/aggregator"
	"dynatrace.com/easytrade/background-service/config"
	"dynatrace.com/easytrade/background-service/contentcreator"
	"dynatrace.com/easytrade/background-service/featureflag"
	"dynatrace.com/easytrade/background-service/logger"
	"dynatrace.com/easytrade/background-service/operator"
	"dynatrace.com/easytrade/background-service/thirdparty"
)

func main() {
	config.LoadLocalEnv()
	values := config.CheckEnv()
	l := logger.GetSugar()

	defer l.Sync()

	if err := openfeature.SetProviderAndWait(featureflag.NewProviderFromEnv(values)); err != nil {
		l.Errorw("Failed to initialize feature flag provider", "err", err)
	}
	flagClient := featureflag.NewAdapter(openfeature.NewClient("background-service"))

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGTERM, syscall.SIGINT)
	defer stop()
	// aggregator-service: 5 platforms x (check-offers + signup) jobs
	aggregator.Start(ctx, values)

	// contentcreator: steady-state per-minute loop + startup backfill
	contentcreator.Start(ctx, values)

	// third-party-service: manufacture + courier schedulers
	tp := thirdparty.New(values, flagClient)
	tp.Start(ctx)

	// problem-operator: watch for changes to the broker-service Deployment and reconcile
	if operator.Enabled() {
		if err := operator.Start(ctx, l, flagClient); err != nil {
			l.Errorw("Operator failed to initialize; continuing without it", "err", err)
		}
	} else {
		l.Info("POD_NAMESPACE not set; operator subsystem disabled")
	}

	srv := New(*tp)
	Run(ctx, srv)
}
