package clock

import (
	"sync"
	"time"
)

type Clock struct {
	interval    time.Duration
	tick        func()
	wg          *sync.WaitGroup // wait group for synchronizing all the goroutines
	nonBlocking bool            // whether new ticks should be run as new goroutines (tick func should guarantee thread safety)
	quitChan    chan struct{}
	quit        bool
}

func newClock(interval time.Duration, tick func(), wg *sync.WaitGroup, nonBlocking bool) *Clock {
	s := &Clock{
		interval:    interval,
		tick:        tick,
		wg:          wg,
		nonBlocking: nonBlocking,
		quit:        false,
		quitChan:    make(chan struct{}),
	}
	return s
}

func NewNonBlockingClock(interval time.Duration, tick func(), wg *sync.WaitGroup) *Clock {
	return newClock(interval, tick, wg, true)
}

func NewBlockingClock(interval time.Duration, tick func(), wg *sync.WaitGroup) *Clock {
	return newClock(interval, tick, wg, false)
}

func (s *Clock) StartWithClockTimer(ct ClockTicker) {
	s.wg.Add(1)
	go func() {
		defer s.wg.Done()
		for {
			select {
			case <-ct.GetTickChannel():
				if s.nonBlocking {
					s.wg.Add(1)
					go func() { // unblocking: start tick func in a new goroutine
						defer s.wg.Done()
						s.tick()
					}()
				} else {
					s.tick()
				}
				if s.quit { // ensures that we won't run any more ticks after stopping the clock (select chooses a random channel)
					ct.Stop()
					return
				}
			case <-s.quitChan:
				ct.Stop()
				return
			}
		}
	}()
}

func (s *Clock) Start() {
	ct := NewRealTimeClockTicker(s.interval)
	s.StartWithClockTimer(ct)
}

func (s *Clock) Stop() {
	close(s.quitChan)
	s.quit = true
}
