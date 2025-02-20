package platform

import (
	"errors"

	"dynatrace.com/easytrade/aggregator-service/config"
	"dynatrace.com/easytrade/aggregator-service/logger"
	"dynatrace.com/easytrade/aggregator-service/offer"
	"dynatrace.com/easytrade/aggregator-service/signup"
)

type Platform struct {
	config.PlatformConfig
	OfferProvider          offer.OfferProvider
	SignupHandler          signup.SignupHandler
	consecutiveFailCounter int
}

var ErrFailCounterLimitExceeded = errors.New("fail counter limit exceeded")

func (p *Platform) CheckOffers(useXml bool) (*offer.Offer, error) {
	l := logger.GetSugar().Named(p.Name)

	var (
		offerResult *offer.OfferResult
		err         error
	)

	l.Infow("Fetching the offers", "useXml", useXml)
	if useXml {
		offerResult, err = p.OfferProvider.GetOffersXml(p.Name, p.Filter, p.MaxFee)
	} else {
		offerResult, err = p.OfferProvider.GetOffersJson(p.Name, p.Filter, p.MaxFee)
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

	l.Infow("Successfully fetched the offers", "requestDuration", offerResult.RequestDuration)

	if offerResult.RequestDuration >= p.RequestTimeLimit {
		p.consecutiveFailCounter++
		l.Warn("Request took too long to process")
	} else {
		p.consecutiveFailCounter = 0
	}

	if p.consecutiveFailCounter >= p.ConsecutiveFailLimit {
		l.Warnw(ErrFailCounterLimitExceeded.Error(), "consecutiveFailCounter", p.consecutiveFailCounter)
		return nil, ErrFailCounterLimitExceeded
	}

	return offerResult.Offer, nil
}

func (p *Platform) Signup(userSignupRequest *signup.SignupRequest) error {
	l := logger.GetSugar().Named(p.Name)

	err := p.SignupHandler.Signup(p.Name, userSignupRequest)
	if err != nil {
		l.Error("Failed to signup the user")
		return err
	}
	l.Infow("Signed up the user", "email", userSignupRequest.Email)
	return nil
}
