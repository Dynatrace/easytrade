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

func Get() *zap.Logger {
	once.Do(func() {
		config := zap.NewProductionConfig()
		if term.IsTerminal(int(os.Stdout.Fd())) {
			config = zap.NewDevelopmentConfig()
		}
		config.DisableStacktrace = true

		logger = zap.Must(config.Build())
	})
	return logger
}

func GetSugar() *zap.SugaredLogger {
	return Get().Sugar()
}
