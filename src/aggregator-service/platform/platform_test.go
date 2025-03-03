package platform

import (
	"errors"
	"testing"
	"time"

	"dynatrace.com/easytrade/aggregator-service/config"
	"dynatrace.com/easytrade/aggregator-service/offer"
)

type offerProviderStub struct {
	shouldFail    bool
	responseTime  time.Duration
	offer         *offer.Offer
	jsonCallCount int
	xmlCallCount  int
}

func (op *offerProviderStub) GetOffersJson(platformName string, productFilter string, maxYearlyFeeFilter float32) (*offer.OfferResult, error) {
	op.jsonCallCount++
	return op.getOffers()
}

func (op *offerProviderStub) GetOffersXml(platformName string, productFilter string, maxYearlyFeeFilter float32) (*offer.OfferResult, error) {
	op.xmlCallCount++
	return op.getOffers()
}

func (op *offerProviderStub) getOffers() (*offer.OfferResult, error) {
	if op.shouldFail {
		return nil, errors.New("test error")
	}
	return &offer.OfferResult{Offer: op.offer, RequestDuration: op.responseTime}, nil
}

func TestCheckOffers_ApiCallCount(t *testing.T) {
	op := &offerProviderStub{}
	p := Platform{OfferProvider: op, PlatformConfig: config.PlatformConfig{ConsecutiveFailLimit: 10, RequestTimeLimit: time.Second}}

	p.CheckOffers(false)
	p.CheckOffers(true)

	if op.jsonCallCount != 1 {
		t.Fatalf("Expected 1 JSON api call, got %d", op.jsonCallCount)
	}
	if op.xmlCallCount != 1 {
		t.Fatalf("Expected 1 XML api call, got %d", op.xmlCallCount)
	}
}

func TestCheckOffers_CorrectResponseAndTime(t *testing.T) {
	op := &offerProviderStub{shouldFail: false, responseTime: time.Second}
	p := Platform{OfferProvider: op, PlatformConfig: config.PlatformConfig{ConsecutiveFailLimit: 10, RequestTimeLimit: time.Minute}}

	p.CheckOffers(false)

	if p.consecutiveFailCounter != 0 {
		t.Fatalf("Expected 0 failures, got %d", p.consecutiveFailCounter)
	}
}

func TestCheckOffers_CorrectResponseWithTimeLimitExceeded(t *testing.T) {
	op := &offerProviderStub{shouldFail: false, responseTime: time.Minute}
	p := Platform{OfferProvider: op, PlatformConfig: config.PlatformConfig{ConsecutiveFailLimit: 10, RequestTimeLimit: time.Second}}

	p.CheckOffers(false)

	if p.consecutiveFailCounter != 1 {
		t.Fatalf("Expected 1 failure, got %d", p.consecutiveFailCounter)
	}
}

func TestCheckOffers_ErrorResponse(t *testing.T) {
	op := &offerProviderStub{shouldFail: true}
	p := Platform{OfferProvider: op}

	p.CheckOffers(false)

	if p.consecutiveFailCounter != 1 {
		t.Fatalf("Expected 1 failure, got %d", p.consecutiveFailCounter)
	}
}

func TestCheckOffers_ConsecutiveFailCounter(t *testing.T) {
	failedAttemptCount := 10
	op := &offerProviderStub{shouldFail: false, responseTime: time.Minute}
	p := Platform{OfferProvider: op, PlatformConfig: config.PlatformConfig{ConsecutiveFailLimit: 5, RequestTimeLimit: time.Second}}

	var err error
	for range failedAttemptCount {
		_, err = p.CheckOffers(false)
	}

	if p.consecutiveFailCounter != failedAttemptCount {
		t.Fatalf("Expected %d failures, got %d", failedAttemptCount, p.consecutiveFailCounter)
	}
	if err != ErrFailCounterLimitExceeded {
		t.Fatalf("Expected %s error, go %s", ErrFailCounterLimitExceeded, err)
	}
}

func TestCheckOffers_CounterReset(t *testing.T) {
	op := &offerProviderStub{shouldFail: true, responseTime: time.Second}
	p := Platform{OfferProvider: op, PlatformConfig: config.PlatformConfig{ConsecutiveFailLimit: 5, RequestTimeLimit: time.Minute}}

	p.CheckOffers(false)
	failedCounter := p.consecutiveFailCounter
	op.shouldFail = false
	p.CheckOffers(false)
	resetCounter := p.consecutiveFailCounter

	if failedCounter != 1 {
		t.Fatalf("Expected 1 failure before success, got %d", failedCounter)
	}
	if resetCounter != 0 {
		t.Fatalf("Expected 0 failures after success, got %d", resetCounter)
	}
}
