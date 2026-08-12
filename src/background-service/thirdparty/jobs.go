package thirdparty

import (
	"context"
	"time"

	"dynatrace.com/easytrade/background-service/config"
	"dynatrace.com/easytrade/background-service/featureflag"
)

const (
	creditCardOrderServiceAddress = "CREDIT_CARD_ORDER_SERVICE_ADDRESS"
	thirdPartyDelay               = "THIRD_PARTY_DELAY"
	thirdPartyRate                = "THIRD_PARTY_RATE"
	delayChancePercent            = "DELAY_CHANCE_PERCENT"
)

func Start(ctx context.Context, values config.Values, flags featureflag.FlagService) Handlers {
	svc := newCreditCardOrderClient(values.Get(creditCardOrderServiceAddress))
	r := newRunner(svc, flags, values.MustInt(delayChancePercent))
	delay := time.Duration(values.MustInt(thirdPartyDelay)) * time.Second
	rate := values.MustInt(thirdPartyRate)
	go r.loop(ctx, delay, rate)
	return Handlers{runner: r}
}
