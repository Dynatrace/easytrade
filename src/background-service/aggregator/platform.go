package aggregator

import (
	"errors"

	"dynatrace.com/easytrade/background-service/logger"
)

var ErrFailCounterLimitExceeded = errors.New("fail counter limit exceeded")

type Platform struct {
	PlatformConfig
	OfferProvider          OfferProvider
	SignupHandler          SignupHandler
	consecutiveFailCounter int
}

func (p *Platform) CheckOffers(useXML bool) (*Offer, error) {
	l := logger.GetSugar().Named(p.Name)

	var (
		result *OfferResult
		err    error
	)

	l.Infow("Fetching the offers", "useXml", useXML)
	if useXML {
		result, err = p.OfferProvider.GetOffersXML(p.Name, p.Filter, p.MaxFee)
	} else {
		result, err = p.OfferProvider.GetOffersJSON(p.Name, p.Filter, p.MaxFee)
	}

	if err != nil {
		l.Error("Failed to fetch the offers")
		p.consecutiveFailCounter++
		if p.consecutiveFailCounter >= p.ConsecutiveFailLimit {
			l.Warnw(ErrFailCounterLimitExceeded.Error(), "consecutiveFailCounter", p.consecutiveFailCounter)
			err = errors.Join(err, ErrFailCounterLimitExceeded)
		}
		return nil, err
	}

	l.Infow("Successfully fetched the offers", "requestDuration", result.RequestDuration)

	if result.RequestDuration >= p.RequestTimeLimit {
		p.consecutiveFailCounter++
		l.Warn("Request took too long to process")
	} else {
		p.consecutiveFailCounter = 0
	}

	if p.consecutiveFailCounter >= p.ConsecutiveFailLimit {
		l.Warnw(ErrFailCounterLimitExceeded.Error(), "consecutiveFailCounter", p.consecutiveFailCounter)
		return nil, ErrFailCounterLimitExceeded
	}

	return result.Offer, nil
}

// Signup submits a signup request for this platform.
func (p *Platform) Signup(req *SignupRequest) error {
	l := logger.GetSugar().Named(p.Name)

	if err := p.SignupHandler.Signup(p.Name, req); err != nil {
		l.Error("Failed to signup the user")
		return err
	}
	l.Infow("Signed up the user", "email", req.Email)
	return nil
}
