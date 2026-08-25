package thirdparty

import (
	"context"
	"time"
)

const (
	creditCardOrderServiceAddress = "CREDIT_CARD_ORDER_SERVICE_ADDRESS"
	thirdPartyDelay               = "THIRD_PARTY_DELAY"
	thirdPartyRate                = "THIRD_PARTY_RATE"
	delayChancePercent            = "DELAY_CHANCE_PERCENT"
)

func (h *Handlers) Start(ctx context.Context) {
	delay := time.Duration(h.values.MustInt(thirdPartyDelay)) * time.Second
	rate := h.values.MustInt(thirdPartyRate)
	go h.runner.loop(ctx, delay, rate)
}
