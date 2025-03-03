package config

import (
	"os"
	"strconv"
)

const (
	OfferServiceProtocolEnv = "OFFER_SERVICE_PROTOCOL"
	OfferServiceHostEnv     = "OFFER_SERVICE_HOST"
	OfferServicePortEnv     = "OFFER_SERVICE_PORT"
)

func (c *OfferServiceConfig) loadEnvironmentVariables() {
	env, found := os.LookupEnv(OfferServiceProtocolEnv)
	if found {
		c.Protocol = env
	}

	env, found = os.LookupEnv(OfferServiceHostEnv)
	if found {
		c.Host = env
	}

	env, found = os.LookupEnv(OfferServicePortEnv)
	if found {
		port, err := strconv.Atoi(env)
		if err == nil {
			c.Port = port
		}
	}
}
