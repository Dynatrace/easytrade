package contentcreator

import (
	"context"
	"math/rand"
	"time"

	"dynatrace.com/easytrade/background-service/logger"
)

const (
	cleanupInterval = 60
	staleAfter      = 24 * time.Hour
	dailyPeriod     = 1440
)

var l = logger.GetSugar().Named("contentcreator")

func (h *Handler) Start(ctx context.Context) {
	go func() {
		now := time.Now().UTC()
		h.initializePricingData(ctx, now)
		h.generatePricingData(ctx, now)
	}()
}

func (h *Handler) initializePricingData(ctx context.Context, now time.Time) {
	rng := rand.New(rand.NewSource(now.UnixNano()))

	l.Infow("Inserting initial pricing data for current minute.")
	if err := h.insertPricingBatch(ctx, newCandlesForTime(Instruments[:], now, rng)); err != nil {
		l.Errorw("Failed to insert initial pricing data", "err", err)
	}

	l.Infow("Removing seed rows inserted before startup time", "before", now)
	if err := h.deletePricingBeforeDate(ctx, now); err != nil {
		l.Errorw("Failed to delete pre-startup seed rows", "err", err)
	}

	go h.runBackfill(ctx, now, dailyPeriod/2)
}

func (h *Handler) generatePricingData(ctx context.Context, cal time.Time) {
	rng := rand.New(rand.NewSource(cal.UnixNano() + 1))

	hourly, daily := 0, 0
	sleepProperly(cal, time.Minute)

	l.Info("Starting endless generation loop with hourly and daily cleanup.")
	for {
		cal = cal.Add(time.Minute)

		l.Infow("Generating and inserting pricing data", "time", cal)
		if err := h.insertPricingBatch(ctx, newCandlesForTime(Instruments[:], cal, rng)); err != nil {
			l.Errorw("Failed to insert pricing data", "err", err)
		}

		doEachTime(cleanupInterval, &hourly, func() { h.doEachHour(ctx, staleAfter) })
		doEachTime(dailyPeriod, &daily, func() { h.doEachDay(ctx) })

		sleepProperly(cal, time.Minute)
	}
}

// doEachTime increments counter and, once it reaches n ticks, resets it and
// fires fn — the generic replacement for the old per-task manual counter
// checks in generatePricingData's loop.
func doEachTime(n int, counter *int, fn func()) {
	*counter++
	if *counter >= n {
		*counter = 0
		fn()
	}
}

// sleepProperly reproduces ContentCreator.sleepProperly: sleep base minus
// however long has already elapsed since cal, floored at zero, so the loop
// lands on the real minute boundary regardless of processing time — not a
// plain fixed-interval sleep.
func sleepProperly(cal time.Time, base time.Duration) {
	elapsed := time.Since(cal)
	timeout := max(base-elapsed, 0)
	time.Sleep(timeout)
}

func (h *Handler) doEachDay(ctx context.Context) {
	l.Info("Generator is running for a whole day. Running daily tasks.")

	if err := h.deletePricingBeforeDate(ctx, time.Now().UTC().AddDate(0, 0, -1)); err != nil {
		l.Errorw("Failed to remove old pricing data", "err", err)
	}
}

func (h *Handler) doEachHour(ctx context.Context, staleAfter time.Duration) {
	l.Info("Running hourly stale-data cleanup.")

	cutoff := time.Now().UTC().Add(-staleAfter)

	if err := h.deleteTradesBeforeDate(ctx, cutoff); err != nil {
		l.Errorw("Failed to remove stale trades", "err", err)
	}

	if err := h.deleteBalanceHistoryBeforeDate(ctx, cutoff); err != nil {
		l.Errorw("Failed to remove stale balance history", "err", err)
	}

	if err := h.deleteStaleAccounts(ctx, cutoff); err != nil {
		l.Errorw("Failed to remove stale accounts", "err", err)
	}
}
