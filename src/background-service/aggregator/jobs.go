package aggregator

import (
	"context"
	"math/rand"
	"time"

	"dynatrace.com/easytrade/background-service/httpclient"
	"dynatrace.com/easytrade/background-service/logger"
)

const xmlProbability = 0.5

func Start(ctx context.Context, cfg *Config) {

	handler := &OfferServiceClient{
		baseURL: cfg.OfferServiceAddress,
		http:    httpclient.New(),
	}

	for i := range cfg.Platforms {
		entry := cfg.Platforms[i]
		p := &Platform{
			PlatformConfig:   entry,
			Delay:            DefaultDelay,
			FailDelay:        DefaultFailDelay,
			SignupInterval:   DefaultSignupInterval,
			RequestTimeLimit: DefaultRequestTimeLimit,
			FailLimit:        DefaultFailLimit,
			Service:          handler,
		}
		logger.GetSugar().Infow("Starting aggregator jobs for platform",
			"platform", p.Name, "checkOffersInterval", p.Delay, "signupInterval", p.SignupInterval)

		go runJob(ctx, p.Delay, func(ctx context.Context) {
			checkOffersTick(ctx, p)
		})

		go runJob(ctx, p.SignupInterval, func(ctx context.Context) {
			signupTick(ctx, p, entry.PackageProbability)
		})
	}
}

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
	format := jsonOfferFormat
	if rand.Float32() <= xmlProbability {
		format = xmlOfferFormat
	}

	if err := p.CheckOffers(ctx, format); err != nil {
		l.Error("Checking the offers failed")
	} else {
		l.Info("Offers checked")
	}

	if p.failureLimitExceeded() {
		l.Warnw("Pausing the platform", "failDelay", p.FailDelay, "failCounter", p.failCounter)
		time.Sleep(p.FailDelay)
	}
}

func signupTick(ctx context.Context, p *Platform, packageProb PackageProbability) {
	l := logger.GetSugar().Named(p.Name)
	l.Info("Signing up a user...")

	sr := newSignupRequest(packageProb)

	if err := p.Service.Signup(ctx, p.Name, sr); err != nil {
		l.Error("Signing up a user failed")
	}
}
