package thirdparty

import (
	"context"
	"sync"
	"testing"
)

type stubCreditCardOrderService struct {
	mu                sync.Mutex
	shippingAddr      *ShippingAddress
	updateStatusCalls []struct {
		status  OrderStatus
		orderID string
		details any
	}
}

func (s *stubCreditCardOrderService) GetShippingAddress(ctx context.Context, orderID string) (*ShippingAddress, error) {
	return s.shippingAddr, nil
}

func (s *stubCreditCardOrderService) UpdateStatus(ctx context.Context, status OrderStatus, orderID string, details any) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.updateStatusCalls = append(s.updateStatusCalls, struct {
		status  OrderStatus
		orderID string
		details any
	}{status, orderID, details})
	return nil
}

func (s *stubCreditCardOrderService) callCountForStatus(status OrderStatus) int {
	s.mu.Lock()
	defer s.mu.Unlock()
	n := 0
	for _, c := range s.updateStatusCalls {
		if c.status == status {
			n++
		}
	}
	return n
}

type stubFlagChecker struct {
	enabled bool
}

func (s *stubFlagChecker) GetBool(ctx context.Context, id string, defaultVal bool) bool {
	return s.enabled
}

// TestManufactureRunner_CrisisDedupGuard is the load-bearing regression test
// called out in the port plan: while factory_crisis stays enabled, a process
// that has already been marked ManufactureError must not be re-reported to
// credit-card-order-service on every subsequent tick. Getting this wrong
// means every tick during a sustained crisis re-POSTs CARD_ERROR for every
// process stuck in the error state.
func TestManufactureRunner_CrisisDedupGuard(t *testing.T) {
	svc := &stubCreditCardOrderService{}
	flags := &stubFlagChecker{enabled: true}
	mQueue := newManufactureQueue()
	cQueue := newCourierQueue()

	process := &ManufactureProcess{Request: CreditCardRequest{CreditCardOrderID: "order-1", Name: "Alice", CardLevel: "gold"}, Status: Issuing}
	mQueue.add(process)

	runner := newManufactureRunner(mQueue, cQueue, svc, flags, 0)

	// Run several ticks while the crisis flag stays enabled.
	for range 5 {
		_ = runner.run(context.Background())
	}

	if process.Status != ManufactureError {
		t.Fatalf("expected process to end up in ManufactureError state, got %v", process.Status)
	}
	if got := svc.callCountForStatus(OrderCardError); got != 1 {
		t.Fatalf("expected exactly 1 CARD_ERROR report despite %d ticks during a sustained crisis, got %d", 5, got)
	}
}

// TestManufactureRunner_CardCreatedHandsOffToCourier verifies a
// successfully-created card is queued for the courier and removed from the
// manufacture queue in the same tick.
func TestManufactureRunner_CardCreatedHandsOffToCourier(t *testing.T) {
	svc := &stubCreditCardOrderService{}
	flags := &stubFlagChecker{enabled: false}
	mQueue := newManufactureQueue()
	cQueue := newCourierQueue()

	process := &ManufactureProcess{Request: CreditCardRequest{CreditCardOrderID: "order-2", Name: "Bob", CardLevel: "silver"}, Status: CardCreated}
	mQueue.add(process)

	runner := newManufactureRunner(mQueue, cQueue, svc, flags, 0)
	_ = runner.run(context.Background())

	if len(mQueue.snapshot()) != 0 {
		t.Fatalf("expected the manufacture queue to be empty after hand-off, got %d items", len(mQueue.snapshot()))
	}
	courierItems := cQueue.snapshot()
	if len(courierItems) != 1 {
		t.Fatalf("expected exactly 1 courier process, got %d", len(courierItems))
	}
	if courierItems[0].CreditCardOrderID != "order-2" || courierItems[0].Status != NewCardReceived {
		t.Fatalf("unexpected courier process: %+v", courierItems[0])
	}
}
