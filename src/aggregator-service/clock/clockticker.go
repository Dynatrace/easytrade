package clock

import "time"

type ClockTicker interface {
	GetTickChannel() <-chan time.Time
	Stop()
}

type RealTimeClockTicker struct {
	ticker *time.Ticker
}

func NewRealTimeClockTicker(interval time.Duration) *RealTimeClockTicker {
	ticker := time.NewTicker(interval)
	return &RealTimeClockTicker{ticker: ticker}
}

func (ct *RealTimeClockTicker) GetTickChannel() <-chan time.Time {
	return ct.ticker.C
}

func (ct *RealTimeClockTicker) Stop() {
	ct.ticker.Stop()
}
