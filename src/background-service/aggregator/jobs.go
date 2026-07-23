package aggregator

import (
	"context"
	"errors"
	"math/rand"
	"time"

	"dynatrace.com/easytrade/background-service/logger"
	"dynatrace.com/easytrade/background-service/scheduler"
)

const xmlProbability = 0.5

func RegisterJobs(ctx context.Context, group *scheduler.Group, cfg *Config) {
	offerProvider := &OfferServiceConnector{baseURL: cfg.OfferServiceAddress}
	signupHandler := &OfferServiceSignupHandler{baseURL: cfg.OfferServiceAddress}

	for i := range cfg.Platforms {
		entry := cfg.Platforms[i]
		p := &Platform{
			PlatformConfig: entry.PlatformConfig,
			OfferProvider:  offerProvider,
			SignupHandler:  signupHandler,
		}
		packageProb := entry.PackageProbability

		logger.GetSugar().Infow("Starting aggregator jobs for platform",
			"platform", p.Name, "checkOffersInterval", p.Delay, "signupInterval", p.SignupInterval)

		group.Add(ctx, scheduler.Job{
			Name:     "aggregator-check-offers-" + p.Name,
			Interval: p.Delay,
			Run: func(ctx context.Context) error {
				checkOffersTick(p)
				return nil
			},
		})

		group.Add(ctx, scheduler.Job{
			Name:     "aggregator-signup-" + p.Name,
			Interval: p.SignupInterval,
			Run: func(ctx context.Context) error {
				signupTick(p, &packageProb)
				return nil
			},
		})
	}
}

func checkOffersTick(p *Platform) {
	l := logger.GetSugar().Named(p.Name)
	l.Info("Checking the offers...")

	useXML := rand.Float32() > xmlProbability
	offer, err := p.CheckOffers(useXML)
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

func signupTick(p *Platform, packageProb *PackageProbability) {
	l := logger.GetSugar().Named(p.Name)
	l.Info("Signing up a user...")

	sr := createFakeSignupRequest(p.Name, packageProb)

	if err := p.Signup(sr); err != nil {
		l.Error("Signing up a user failed")
	} else {
		l.Info("User signed up")
	}
}
