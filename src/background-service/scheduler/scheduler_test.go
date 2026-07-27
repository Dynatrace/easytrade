package scheduler

import (
	"context"
	"errors"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

func TestRunner_TicksUntilStopped(t *testing.T) {
	var ticks int64
	r := NewRunner(Job{
		Name:     "test",
		Interval: time.Millisecond,
		Run: func(ctx context.Context) error {
			atomic.AddInt64(&ticks, 1)
			return nil
		},
	})

	var wg sync.WaitGroup
	r.Start(context.Background(), &wg)

	time.Sleep(50 * time.Millisecond)
	r.Stop()
	wg.Wait()

	if got := atomic.LoadInt64(&ticks); got == 0 {
		t.Fatalf("expected at least one tick, got %d", got)
	}

	afterStop := atomic.LoadInt64(&ticks)
	time.Sleep(20 * time.Millisecond)
	if atomic.LoadInt64(&ticks) != afterStop {
		t.Fatalf("expected no ticks after Stop, ticks grew from %d to %d", afterStop, atomic.LoadInt64(&ticks))
	}
}

func TestRunner_StopsOnContextCancel(t *testing.T) {
	var ticks int64
	ctx, cancel := context.WithCancel(context.Background())

	r := NewRunner(Job{
		Name:     "test",
		Interval: time.Millisecond,
		Run: func(ctx context.Context) error {
			atomic.AddInt64(&ticks, 1)
			return nil
		},
	})

	var wg sync.WaitGroup
	r.Start(ctx, &wg)

	time.Sleep(10 * time.Millisecond)
	cancel()

	done := make(chan struct{})
	go func() { wg.Wait(); close(done) }()

	select {
	case <-done:
	case <-time.After(time.Second):
		t.Fatal("runner did not stop after context cancellation")
	}
}

func TestAdaptiveRunner_BacksOffOnError(t *testing.T) {
	var calls int64
	errBoom := errors.New("boom")

	var mu sync.Mutex
	var seenIntervals []time.Duration

	r := NewAdaptiveRunner(Job{
		Name:     "test",
		Interval: 5 * time.Millisecond,
		Run: func(ctx context.Context) error {
			atomic.AddInt64(&calls, 1)
			return errBoom
		},
	}, func(err error, current time.Duration) time.Duration {
		next := time.Duration(float64(current) * 1.1)
		mu.Lock()
		seenIntervals = append(seenIntervals, next)
		mu.Unlock()
		return next
	})

	var wg sync.WaitGroup
	ctx, cancel := context.WithCancel(context.Background())
	r.Start(ctx, &wg)

	time.Sleep(60 * time.Millisecond)
	cancel()
	wg.Wait()

	mu.Lock()
	defer mu.Unlock()
	if len(seenIntervals) < 2 {
		t.Fatalf("expected backoff to be invoked multiple times, got %d", len(seenIntervals))
	}
	for i := 1; i < len(seenIntervals); i++ {
		if seenIntervals[i] <= seenIntervals[i-1] {
			t.Fatalf("expected interval to grow monotonically, got %v then %v", seenIntervals[i-1], seenIntervals[i])
		}
	}
}

func TestGroup_StopAllStopsEveryRunner(t *testing.T) {
	group := NewGroup()
	var tickerA, tickerB int64

	group.Add(context.Background(), Job{
		Name:     "a",
		Interval: time.Millisecond,
		Run: func(ctx context.Context) error {
			atomic.AddInt64(&tickerA, 1)
			return nil
		},
	})
	group.Add(context.Background(), Job{
		Name:     "b",
		Interval: time.Millisecond,
		Run: func(ctx context.Context) error {
			atomic.AddInt64(&tickerB, 1)
			return nil
		},
	})

	time.Sleep(20 * time.Millisecond)
	group.StopAll()
	group.Wait()

	a, b := atomic.LoadInt64(&tickerA), atomic.LoadInt64(&tickerB)
	if a == 0 || b == 0 {
		t.Fatalf("expected both jobs to have ticked, got a=%d b=%d", a, b)
	}
}
