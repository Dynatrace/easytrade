package aggregator

import (
	"context"
	"errors"
	"testing"
	"time"
)

type offerServiceStub struct {
	shouldFail    bool
	responseTime  time.Duration
	jsonCallCount int
	xmlCallCount  int
}

func (op *offerServiceStub) GetOffers(ctx context.Context, platformName, productFilter string, maxYearlyFeeFilter *float32, format offerFormat) (time.Duration, error) {
	if format == xmlOfferFormat {
		op.xmlCallCount++
	} else {
		op.jsonCallCount++
	}
	return op.getOffers()
}

func (op *offerServiceStub) Signup(ctx context.Context, platformName string, request *SignupRequest) error {
	return nil
}

func (op *offerServiceStub) getOffers() (time.Duration, error) {
	if op.shouldFail {
		return 0, errors.New("test error")
	}
	return op.responseTime, nil
}

func TestCheckOffers_ApiCallCount(t *testing.T) {
	op := &offerServiceStub{}
	p := Platform{Service: op, FailLimit: 10, RequestTimeLimit: time.Second}

	p.CheckOffers(context.Background(), jsonOfferFormat)
	p.CheckOffers(context.Background(), xmlOfferFormat)

	if op.jsonCallCount != 1 {
		t.Fatalf("Expected 1 JSON api call, got %d", op.jsonCallCount)
	}
	if op.xmlCallCount != 1 {
		t.Fatalf("Expected 1 XML api call, got %d", op.xmlCallCount)
	}
}

func TestCheckOffers_CorrectResponseAndTime(t *testing.T) {
	op := &offerServiceStub{shouldFail: false, responseTime: time.Second}
	p := Platform{Service: op, FailLimit: 10, RequestTimeLimit: time.Minute}

	p.CheckOffers(context.Background(), jsonOfferFormat)

	if p.failCounter != 0 {
		t.Fatalf("Expected 0 failures, got %d", p.failCounter)
	}
}

func TestCheckOffers_CorrectResponseWithTimeLimitExceeded(t *testing.T) {
	op := &offerServiceStub{shouldFail: false, responseTime: time.Minute}
	p := Platform{Service: op, FailLimit: 10, RequestTimeLimit: time.Second}

	p.CheckOffers(context.Background(), jsonOfferFormat)

	if p.failCounter != 1 {
		t.Fatalf("Expected 1 failure, got %d", p.failCounter)
	}
}

func TestCheckOffers_ErrorResponse(t *testing.T) {
	op := &offerServiceStub{shouldFail: true}
	p := Platform{Service: op}

	p.CheckOffers(context.Background(), jsonOfferFormat)

	if p.failCounter != 1 {
		t.Fatalf("Expected 1 failure, got %d", p.failCounter)
	}
}

func TestCheckOffers_FailCounter(t *testing.T) {
	failedAttemptCount := 10
	op := &offerServiceStub{shouldFail: false, responseTime: time.Minute}
	p := Platform{Service: op, FailLimit: 5, RequestTimeLimit: time.Second}

	for range failedAttemptCount {
		p.CheckOffers(context.Background(), jsonOfferFormat)
	}

	if p.failCounter != failedAttemptCount {
		t.Fatalf("Expected %d failures, got %d", failedAttemptCount, p.failCounter)
	}
	if !p.failureLimitExceeded() {
		t.Fatalf("Expected failure limit to be exceeded, failCounter=%d, FailLimit=%d", p.failCounter, p.FailLimit)
	}
}

func TestCheckOffers_CounterReset(t *testing.T) {
	op := &offerServiceStub{shouldFail: true, responseTime: time.Second}
	p := Platform{Service: op, FailLimit: 5, RequestTimeLimit: time.Minute}

	p.CheckOffers(context.Background(), jsonOfferFormat)
	failedCounter := p.failCounter
	op.shouldFail = false
	p.CheckOffers(context.Background(), jsonOfferFormat)
	resetCounter := p.failCounter

	if failedCounter != 1 {
		t.Fatalf("Expected 1 failure before success, got %d", failedCounter)
	}
	if resetCounter != 0 {
		t.Fatalf("Expected 0 failures after success, got %d", resetCounter)
	}
}
