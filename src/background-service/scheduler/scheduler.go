package scheduler

import (
	"context"
	"sync"
	"time"
)

type Job struct {
	Name     string
	Interval time.Duration
	Run      func(ctx context.Context) error
}

type stoppable interface{ Stop() }

type Runner struct {
	job      Job
	quit     chan struct{}
	quitOnce sync.Once
}

func NewRunner(job Job) *Runner {
	return &Runner{job: job, quit: make(chan struct{})}
}

// Start runs job on its own goroutine, ticking at job.Interval, until ctx is
// cancelled or Stop is called. wg is marked Done when the goroutine exits.
func (r *Runner) Start(ctx context.Context, wg *sync.WaitGroup) {
	ticker := time.NewTicker(r.job.Interval)
	wg.Go(func() {
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				_ = r.job.Run(ctx)
			case <-r.quit:
				return
			case <-ctx.Done():
				return
			}
		}
	})
}

func (r *Runner) Stop() {
	r.quitOnce.Do(func() { close(r.quit) })
}

type AdaptiveRunner struct {
	job      Job
	backoff  func(err error, current time.Duration) time.Duration
	quit     chan struct{}
	quitOnce sync.Once
}

func NewAdaptiveRunner(job Job, backoff func(err error, current time.Duration) time.Duration) *AdaptiveRunner {
	return &AdaptiveRunner{job: job, backoff: backoff, quit: make(chan struct{})}
}

// Start runs job on its own goroutine, as Runner.Start does, but re-evaluates
// the tick interval via backoff after every tick that returns an error.
func (r *AdaptiveRunner) Start(ctx context.Context, wg *sync.WaitGroup) {
	interval := r.job.Interval
	ticker := time.NewTicker(interval)
	wg.Go(func() {
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				if err := r.job.Run(ctx); err != nil {
					if next := r.backoff(err, interval); next != interval {
						interval = next
						ticker.Reset(interval)
					}
				}
			case <-r.quit:
				return
			case <-ctx.Done():
				return
			}
		}
	})
}

func (r *AdaptiveRunner) Stop() {
	r.quitOnce.Do(func() { close(r.quit) })
}

type Group struct {
	wg      sync.WaitGroup
	runners []stoppable
}

func NewGroup() *Group { return &Group{} }

func (g *Group) Add(ctx context.Context, job Job) *Runner {
	r := NewRunner(job)
	g.runners = append(g.runners, r)
	r.Start(ctx, &g.wg)
	return r
}

func (g *Group) AddAdaptive(ctx context.Context, job Job, backoff func(err error, current time.Duration) time.Duration) *AdaptiveRunner {
	r := NewAdaptiveRunner(job, backoff)
	g.runners = append(g.runners, r)
	r.Start(ctx, &g.wg)
	return r
}

func (g *Group) StopAll() {
	for _, r := range g.runners {
		r.Stop()
	}
}

func (g *Group) Wait() { g.wg.Wait() }
