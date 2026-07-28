package thirdparty

import (
	"context"
	"math/rand"
	"sync"
	"time"

	"dynatrace.com/easytrade/background-service/config"
	"dynatrace.com/easytrade/background-service/featureflag"
)

const (
	creditCardOrderServiceAddress = "CREDIT_CARD_ORDER_SERVICE_ADDRESS"
	manufactureDelay              = "MANUFACTURE_DELAY"
	manufactureRate               = "MANUFACTURE_RATE"
	courierDelay                  = "COURIER_DELAY"
	courierRate                   = "COURIER_RATE"
)

type jitterSleeper struct {
	mu  sync.Mutex
	rng *rand.Rand
}

func newJitterSleeper() *jitterSleeper {
	return &jitterSleeper{rng: rand.New(rand.NewSource(time.Now().UnixNano()))}
}

func (j *jitterSleeper) sleep(rateSeconds int) {
	j.mu.Lock()
	extra := j.rng.Intn(rateSeconds)
	j.mu.Unlock()
	time.Sleep(time.Duration(rateSeconds+extra) * time.Second)
}

func Start(ctx context.Context, values config.Values, flags *featureflag.Client) Handlers {
	svc := newCreditCardOrderClient(values.Get(creditCardOrderServiceAddress))

	mQueue := newManufactureQueue()
	cQueue := newCourierQueue()

	manufacture := newManufactureRunner(mQueue, cQueue, svc, flags, values.MustInt(manufactureDelayChancePercent))
	courier := newCourierRunner(cQueue, svc)

	mDelay := time.Duration(values.MustInt(manufactureDelay)) * time.Second
	mRate := values.MustInt(manufactureRate)
	cDelay := time.Duration(values.MustInt(courierDelay)) * time.Second
	cRate := values.MustInt(courierRate)

	go runScheduler(ctx, mDelay, mRate, manufacture.run)
	go runScheduler(ctx, cDelay, cRate, courier.run)

	return Handlers{queue: mQueue}
}

func runScheduler(ctx context.Context, initialDelay time.Duration, rateSeconds int, run func(ctx context.Context) error) {
	jitter := newJitterSleeper()

	select {
	case <-time.After(initialDelay):
	case <-ctx.Done():
		return
	}

	for ctx.Err() == nil {
		_ = run(ctx)
		jitter.sleep(rateSeconds)
	}
}
