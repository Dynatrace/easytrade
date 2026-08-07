package contentcreator

import (
	"time"

	"dynatrace.com/easytrade/background-service/logger"
)

const (
	cleanupInterval = 60
	staleAfter      = 24 * time.Hour
	dailyPeriod     = 1440
)

var l = logger.GetSugar().Named("contentcreator")

type Ticker struct {
	limit   int
	counter int
	fn      func()
}

func newTicker(limit int, fn func()) *Ticker {
	return &Ticker{limit: limit, fn: fn}
}

func (t *Ticker) tick() {
	t.counter++
	if t.counter >= t.limit {
		t.counter = 0
		t.fn()
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
