package main

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/open-feature/go-sdk/openfeature"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	"dynatrace.com/easytrade/background-service/aggregator"
	"dynatrace.com/easytrade/background-service/config"
	"dynatrace.com/easytrade/background-service/contentcreator"
	"dynatrace.com/easytrade/background-service/featureflag"
	"dynatrace.com/easytrade/background-service/logger"
	"dynatrace.com/easytrade/background-service/operator"
	"dynatrace.com/easytrade/background-service/server"
	"dynatrace.com/easytrade/background-service/thirdparty"
)

const (
	dbAdapterServiceAddress = "DB_ADAPTER_SERVICE_ADDRESS"
	contentCleanupInterval  = "CONTENT_CLEANUP_INTERVAL"
	contentStaleAfterHours  = "CONTENT_STALE_AFTER_HOURS"
)

func main() {
	config.LoadLocalEnv()
	values := config.CheckEnv()

	l := logger.GetSugar()
	defer l.Sync()

	ctx := context.Background()

	if err := openfeature.SetProviderAndWait(featureflag.NewProviderFromEnv(values)); err != nil {
		l.Errorw("Failed to initialize feature flag provider", "err", err)
	}
	flagClient := featureflag.NewAdapter(openfeature.NewClient("background-service"))

	// aggregator-service: 5 platforms x (check-offers + signup) jobs
	aggCfg := aggregator.LoadConfig(values)
	aggregator.Start(ctx, aggCfg)

	// contentcreator: steady-state per-minute loop + startup backfill
	conn, err := grpc.NewClient(
		values.Get(dbAdapterServiceAddress),
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	defer conn.Close()

	cleanupInterval := values.MustInt(contentCleanupInterval)
	staleAfter := time.Duration(values.MustInt(contentStaleAfterHours)) * time.Hour
	contentcreator.NewHandler(conn).Start(ctx, cleanupInterval, staleAfter)

	// third-party-service: manufacture + courier schedulers
	thirdpartyHandlers := thirdparty.Start(ctx, values, flagClient)

	// problem-operator: watch for changes to the broker-service Deployment and reconcile
	if operator.Enabled() {
		opCfg, err := operator.NewDefaultConfig(l.Named("operator"), flagClient)
		if err != nil {
			l.Errorw("Operator failed to initialize; continuing without it", "err", err)
		} else {
			op := opCfg.Build()
			op.Start(ctx)
			defer op.Shutdown()
		}
	} else {
		l.Info("POD_NAMESPACE not set; operator subsystem disabled")
	}

	srv := server.New(thirdpartyHandlers)
	go server.Run(ctx, srv)

	select {}
}
