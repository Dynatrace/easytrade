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

// TestRunner_CrisisDedupGuard is the load-bearing regression test called out
// in the port plan: while factory_crisis stays enabled, an order that has
// already been marked OrderCardError must not be re-reported to
// credit-card-order-service on every subsequent tick. Getting this wrong
// means every tick during a sustained crisis re-POSTs CARD_ERROR for every
// order stuck in the error state.
func TestRunner_CrisisDedupGuard(t *testing.T) {
	svc := &stubCreditCardOrderService{}
	flags := &stubFlagChecker{enabled: true}
	r := newRunner(svc, flags, 0)

	order := &Order{Request: CreditCardRequest{CreditCardOrderID: "order-1", Name: "Alice", CardLevel: "gold"}, Status: OrderCardOrdered}
	r.orders = append(r.orders, order)

	// Run several ticks while the crisis flag stays enabled.
	for range 5 {
		r.tick(context.Background())
	}

	if order.Status != OrderCardError {
		t.Fatalf("expected order to end up in OrderCardError state, got %v", order.Status)
	}
	if got := svc.callCountForStatus(OrderCardError); got != 1 {
		t.Fatalf("expected exactly 1 CARD_ERROR report despite 5 ticks during a sustained crisis, got %d", got)
	}
}

// TestRunner_ManufactureSuccess verifies the manufacture success path: an
// order transitions straight from OrderCardOrdered to OrderCardCreated with
// card details populated, and is reported exactly once.
func TestRunner_ManufactureSuccess(t *testing.T) {
	svc := &stubCreditCardOrderService{}
	flags := &stubFlagChecker{enabled: false}
	r := newRunner(svc, flags, 0)

	order := &Order{Request: CreditCardRequest{CreditCardOrderID: "order-2", Name: "Bob", CardLevel: "silver"}, Status: OrderCardOrdered}
	r.orders = append(r.orders, order)

	r.tick(context.Background())

	if order.Status != OrderCardCreated {
		t.Fatalf("expected OrderCardCreated after successful manufacture, got %v", order.Status)
	}
	if order.CardDetails == nil {
		t.Fatal("expected card details to be populated")
	}
	if got := svc.callCountForStatus(OrderCardCreated); got != 1 {
		t.Fatalf("expected exactly 1 CARD_CREATED report, got %d", got)
	}
}

// TestRunner_ShippingNotFound_LeavesOrderUntouched verifies that when the
// shipping address isn't found, the order is left in place with no status
// change, to be retried on a later tick — not treated as an error or removed.
func TestRunner_ShippingNotFound_LeavesOrderUntouched(t *testing.T) {
	svc := &stubCreditCardOrderService{shippingAddr: nil}
	r := newRunner(svc, &stubFlagChecker{}, 0)

	order := &Order{Request: CreditCardRequest{CreditCardOrderID: "order-3"}, Status: OrderCardCreated}
	r.orders = append(r.orders, order)

	r.tick(context.Background())

	if order.Status != OrderCardCreated {
		t.Fatalf("expected status to remain OrderCardCreated when address isn't found, got %v", order.Status)
	}
	if len(r.orders) != 1 {
		t.Fatalf("expected the order to remain in the runner, got %d items", len(r.orders))
	}
}

// TestRunner_FullLifecycle walks an order through
// OrderCardCreated -> OrderCardShipped -> OrderCardDelivered -> removed.
func TestRunner_FullLifecycle(t *testing.T) {
	svc := &stubCreditCardOrderService{shippingAddr: &ShippingAddress{Name: "Carol", Email: "carol@example.com"}}
	r := newRunner(svc, &stubFlagChecker{}, 0)

	order := &Order{Request: CreditCardRequest{CreditCardOrderID: "order-4"}, Status: OrderCardCreated}
	r.orders = append(r.orders, order)

	r.tick(context.Background())

	t.Run("status becomes CardShipped after first tick", func(t *testing.T) {
		if order.Status != OrderCardShipped {
			t.Fatalf("expected OrderCardShipped after first tick, got %v", order.Status)
		}
	})

	t.Run("shipping id is assigned", func(t *testing.T) {
		if order.ShippingID == "" {
			t.Fatal("expected a shipping id to be assigned")
		}
	})

	r.tick(context.Background())

	t.Run("status becomes CardDelivered after second tick", func(t *testing.T) {
		if order.Status != OrderCardDelivered {
			t.Fatalf("expected OrderCardDelivered after second tick, got %v", order.Status)
		}
	})

	r.tick(context.Background())

	t.Run("order is removed after delivery", func(t *testing.T) {
		if len(r.orders) != 0 {
			t.Fatalf("expected the order to be removed after being delivered, got %d items", len(r.orders))
		}
	})

	t.Run("exactly one CARD_SHIPPED report is sent", func(t *testing.T) {
		if got := svc.callCountForStatus(OrderCardShipped); got != 1 {
			t.Fatalf("expected exactly 1 CARD_SHIPPED report, got %d", got)
		}
	})

	t.Run("exactly one CARD_DELIVERED report is sent", func(t *testing.T) {
		if got := svc.callCountForStatus(OrderCardDelivered); got != 1 {
			t.Fatalf("expected exactly 1 CARD_DELIVERED report, got %d", got)
		}
	})
}

// TestRunner_Submit verifies that orders sent through Submit are picked up by
// drainIncoming without blocking the caller.
func TestRunner_Submit(t *testing.T) {
	svc := &stubCreditCardOrderService{}
	r := newRunner(svc, &stubFlagChecker{}, 0)

	r.Submit(CreditCardRequest{CreditCardOrderID: "order-5", Name: "Dave", CardLevel: "bronze"})
	r.drainIncoming()

	if len(r.orders) != 1 {
		t.Fatalf("expected 1 order after drain, got %d", len(r.orders))
	}
	if r.orders[0].Status != OrderCardOrdered {
		t.Fatalf("expected submitted order to start as OrderCardOrdered, got %v", r.orders[0].Status)
	}
}
