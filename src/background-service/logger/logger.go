// Package logger provides the single zap logger used by every package in
// background-service, replacing the separate logger singletons that
// aggregator-service and problem-operator each maintained independently.
package logger

import (
	"os"
	"sync"

	"go.uber.org/zap"
	"golang.org/x/term"
)

var (
	logger *zap.Logger
	once   sync.Once
)

// Get returns the process-wide logger, building it on first use. Uses a
// human-readable development config when attached to a terminal, and a JSON
// production config otherwise (e.g. under a container runtime).
func Get() *zap.Logger {
	once.Do(func() {
		cfg := zap.NewProductionConfig()
		if term.IsTerminal(int(os.Stdout.Fd())) {
			cfg = zap.NewDevelopmentConfig()
		}
		cfg.DisableStacktrace = true

		logger = zap.Must(cfg.Build())
	})
	return logger
}

// GetSugar returns the sugared form of Get(), for printf-style logging.
func GetSugar() *zap.SugaredLogger {
	return Get().Sugar()
}
