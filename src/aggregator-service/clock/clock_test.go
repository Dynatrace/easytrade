package clock

import (
	"sync"
	"testing"
	"time"
)

type manualClockTicker struct {
	timeChan    chan time.Time // unlike time.Timer, this channel size is not limited to 1
	tickCounter int64
}

func newManualClockTicker() *manualClockTicker {
	return &manualClockTicker{timeChan: make(chan time.Time), tickCounter: 0}
}

func (ct *manualClockTicker) GetTickChannel() <-chan time.Time {
	return ct.timeChan
}

func (ct *manualClockTicker) Stop() {}

func (ct *manualClockTicker) Tick() {
	ct.tickCounter++
	ct.timeChan <- time.Unix(ct.tickCounter, 0)
}

func TestNonBlockingClock(t *testing.T) {
	tick_counter := 0
	expected_ticks := 100
	wg := sync.WaitGroup{}
	ct := newManualClockTicker()
	sem := make(chan struct{}, 1)
	c := NewNonBlockingClock(0, func() {
		sem <- struct{}{}
		tick_counter++
		<-sem
	}, &wg)

	c.StartWithClockTimer(ct)
	for range expected_ticks {
		ct.Tick()
	}
	c.Stop()
	wg.Wait()

	if tick_counter != expected_ticks {
		t.Fatalf("Expected %d ticks, got %d", expected_ticks, tick_counter)
	}
}

func TestBlockingClock(t *testing.T) {
	tick_counter := 0
	expected_ticks := 100
	wg := sync.WaitGroup{}
	ct := newManualClockTicker()
	c := NewBlockingClock(0, func() {
		tick_counter++
	}, &wg)

	c.StartWithClockTimer(ct)
	for range expected_ticks {
		ct.Tick()
	}
	c.Stop()
	wg.Wait()

	if tick_counter != expected_ticks {
		t.Fatalf("Expected %d ticks, got %d", expected_ticks, tick_counter)
	}
}
