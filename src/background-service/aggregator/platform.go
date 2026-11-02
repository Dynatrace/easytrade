package aggregator

import (
	"context"
	"time"

	"dynatrace.com/easytrade/background-service/logger"
)

const (
	DefaultDelay            = 3 * time.Second
	DefaultFailDelay        = 15 * time.Minute
	DefaultRequestTimeLimit = time.Second
	DefaultSignupInterval   = time.Hour
	DefaultFailLimit        = 50
)

type OfferService interface {
	GetOffers(ctx context.Context, platformName string, filter string, maxFee *float32, format offerFormat) (time.Duration, error)
	Signup(ctx context.Context, platformName string, request *SignupRequest) error
}

type Platform struct {
	PlatformConfig
	Delay            time.Duration
	FailDelay        time.Duration
	SignupInterval   time.Duration
	RequestTimeLimit time.Duration
	FailLimit        int
	failCounter      int
	Service          OfferService
}

func (p *Platform) CheckOffers(ctx context.Context, format offerFormat) error {
	l := logger.GetSugar().Named(p.Name)

	l.Infow("Fetching the offers", "format", format.mimeType())

	requestDuration, err := p.Service.GetOffers(ctx, p.Name, p.Filter, p.MaxFee, format)
	if err != nil {
		l.Warnw("Failed to fetch the offers", "error", err)
		p.failCounter++
		return err
	}

	l.Infow("Successfully fetched the offers", "requestDuration", requestDuration)

	if requestDuration >= p.RequestTimeLimit {
		l.Warn("Request took too long to process")
		p.failCounter++
		return nil
	}

	p.failCounter = 0
	return nil
}

func (p *Platform) failureLimitExceeded() bool {
	return p.failCounter >= p.FailLimit
}
