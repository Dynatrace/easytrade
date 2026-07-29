package db

import (
	"context"
	"fmt"
	"time"

	log "github.com/sirupsen/logrus"
)

type ConnectOptions struct {
	Timeout       time.Duration
	RetryInterval time.Duration
}

func Connect[T any](ctx context.Context, opts ConnectOptions, fn func() (T, error)) (T, error) {
	ctx, cancel := context.WithTimeout(ctx, opts.Timeout)
	defer cancel()

	ticker := time.NewTicker(opts.RetryInterval)
	defer ticker.Stop()

	var lastErr error
	for {
		handle, err := fn()
		if err == nil {
			log.Info("Connected to database")
			return handle, nil
		}
		lastErr = err
		log.WithError(err).Info("Waiting for database...")
		select {
		case <-ctx.Done():
			var zero T
			return zero, fmt.Errorf("could not connect to database after %s: %w", opts.Timeout, lastErr)
		case <-ticker.C:
		}
	}
}
