package aggregator

import (
	"context"
	"errors"
	"math/rand"
	"time"

	"dynatrace.com/easytrade/background-service/httpclient"
	"dynatrace.com/easytrade/background-service/logger"
)

const xmlProbability = 0.5

func RegisterJobs(ctx context.Context, cfg *Config) {

	handler := &OfferServiceClient{
		baseURL: cfg.OfferServiceAddress,
		http:    httpclient.New(),
	}

	for i := range cfg.Platforms {
		entry := cfg.Platforms[i]
		p := &Platform{
			PlatformConfig: entry.PlatformConfig,
			OfferProvider:  handler,
			SignupHandler:  handler,
		}
		packageProb := entry.PackageProbability

		logger.GetSugar().Infow("Starting aggregator jobs for platform",
			"platform", p.Name, "checkOffersInterval", p.Delay, "signupInterval", p.SignupInterval)

		go runJob(ctx, p.Delay, func(ctx context.Context) {
			checkOffersTick(ctx, p)
		})

		go runJob(ctx, p.SignupInterval, func(ctx context.Context) {
			signupTick(ctx, p, &packageProb)
		})
	}
}

// runJob ticks at interval, invoking tick each time, until ctx is cancelled.
func runJob(ctx context.Context, interval time.Duration, tick func(ctx context.Context)) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()
	for {
		select {
		case <-ticker.C:
			tick(ctx)
		case <-ctx.Done():
			return
		}
	}
}

func checkOffersTick(ctx context.Context, p *Platform) {
	l := logger.GetSugar().Named(p.Name)
	l.Info("Checking the offers...")

	useXML := rand.Float32() <= xmlProbability
	offer, err := p.CheckOffers(ctx, useXML)
	if err != nil {
		l.Error("Checking the offers failed")
	} else {
		l.Infow("Offers checked", "offer", offer)
	}

	if errors.Is(err, ErrFailCounterLimitExceeded) {
		l.Warnw("Pausing the platform", "failDelay", p.FailDelay)
		time.Sleep(p.FailDelay)
	}
}

func signupTick(ctx context.Context, p *Platform, packageProb *PackageProbability) {
	l := logger.GetSugar().Named(p.Name)
	l.Info("Signing up a user...")

	sr := createFakeSignupRequest(p.Name, packageProb)

	if err := p.Signup(ctx, sr); err != nil {
		l.Error("Signing up a user failed")
	} else {
		l.Info("User signed up")
	}
}
