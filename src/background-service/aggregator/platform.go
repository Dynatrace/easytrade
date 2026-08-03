package aggregator

import (
	"context"
	"errors"
	"time"

	"dynatrace.com/easytrade/background-service/logger"
)

var ErrFailCounterLimitExceeded = errors.New("fail counter limit exceeded")

const (
	DefaultDelay            = 3 * time.Second
	DefaultFailDelay        = 15 * time.Minute
	DefaultRequestTimeLimit = time.Second
	DefaultSignupInterval   = time.Hour
	DefaultFailLimit        = 50
)

type OfferService interface {
	GetOffers(ctx context.Context, platformName string, filter string, maxFee float32, format offerFormat) (*OfferResult, error)
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

func (p *Platform) CheckOffers(ctx context.Context, format offerFormat) (*Offer, error) {
	l := logger.GetSugar().Named(p.Name)

	l.Infow("Fetching the offers", "format", format.mimeType())

	result, err := p.Service.GetOffers(ctx, p.Name, p.Filter, p.MaxFee, format)
	if err != nil {
		l.Error("Failed to fetch the offers")
		p.failCounter++
		if p.failCounter >= p.FailLimit {
			l.Warnw(ErrFailCounterLimitExceeded.Error(), "failCounter", p.failCounter)
			err = errors.Join(err, ErrFailCounterLimitExceeded)
		}
		return nil, err
	}

	l.Infow("Successfully fetched the offers", "requestDuration", result.RequestDuration)

	if result.RequestDuration >= p.RequestTimeLimit {
		p.failCounter++
		l.Warn("Request took too long to process")
	} else {
		p.failCounter = 0
	}

	if p.failCounter >= p.FailLimit {
		l.Warnw(ErrFailCounterLimitExceeded.Error(), "failCounter", p.failCounter)
		return nil, ErrFailCounterLimitExceeded
	}

	return result.Offer, nil
}

func (p *Platform) Signup(ctx context.Context, req *SignupRequest) error {
	l := logger.GetSugar().Named(p.Name)

	if err := p.Service.Signup(ctx, p.Name, req); err != nil {
		l.Error("Failed to signup the user")
		return err
	}
	l.Infow("Signed up the user", "email", req.Email)
	return nil
}
