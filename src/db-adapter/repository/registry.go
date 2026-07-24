package repository

import (
	"fmt"

	"github.com/dynatrace/easytrade/dbadapter/config"
)

type Provider interface {
	Connect(cfg config.DatabaseConfig) (CompositeRepository, error)
}

var providers = map[string]Provider{}

func Register(name string, provider Provider) {
	if _, exists := providers[name]; exists {
		panic(fmt.Sprintf("repository: provider %q already registered", name))
	}
	providers[name] = provider
}

func Open(cfg config.DatabaseConfig) (CompositeRepository, error) {
	provider, ok := providers[cfg.Type]
	if !ok {
		return nil, fmt.Errorf("unsupported database type: %q", cfg.Type)
	}
	return provider.Connect(cfg)
}
