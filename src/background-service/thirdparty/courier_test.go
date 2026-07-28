package thirdparty

import (
	"context"
	"testing"
)

// TestCourierRunner_NotFoundLeavesProcessUntouched verifies that when the
// shipping address isn't found, the process is left in the queue with no
// status change, to be retried on a later tick — not treated as an error or
// removed.
func TestCourierRunner_NotFoundLeavesProcessUntouched(t *testing.T) {
	svc := &stubCreditCardOrderService{shippingAddr: nil}
	queue := newCourierQueue()
	process := &CourierProcess{CreditCardOrderID: "order-3", Status: NewCardReceived}
	queue.add(process)

	runner := newCourierRunner(queue, svc)
	_ = runner.run(context.Background())

	if process.Status != NewCardReceived {
		t.Fatalf("expected status to remain NewCardReceived when address isn't found, got %v", process.Status)
	}
	if len(queue.snapshot()) != 1 {
		t.Fatalf("expected the process to remain in the queue, got %d items", len(queue.snapshot()))
	}
}

// TestCourierRunner_FullLifecycle walks a process through
// NewCardReceived -> CardSent -> CardDelivered -> removed, matching
// CourierScheduler's original state machine.
func TestCourierRunner_FullLifecycle(t *testing.T) {
	svc := &stubCreditCardOrderService{shippingAddr: &ShippingAddress{Name: "Carol", Email: "carol@example.com"}}
	queue := newCourierQueue()
	process := &CourierProcess{CreditCardOrderID: "order-4", Status: NewCardReceived}
	queue.add(process)

	runner := newCourierRunner(queue, svc)

	_ = runner.run(context.Background())

	t.Run("status becomes CardSent after first tick", func(t *testing.T) {
		if process.Status != CardSent {
			t.Fatalf("expected CardSent after first tick, got %v", process.Status)
		}
	})

	t.Run("shipping id is assigned", func(t *testing.T) {
		if process.ShippingID == "" {
			t.Fatal("expected a shipping id to be assigned")
		}
	})

	_ = runner.run(context.Background())

	t.Run("status becomes CardDelivered after second tick", func(t *testing.T) {
		if process.Status != CardDelivered {
			t.Fatalf("expected CardDelivered after second tick, got %v", process.Status)
		}
	})

	_ = runner.run(context.Background())

	t.Run("process is removed from queue after delivery", func(t *testing.T) {
		if len(queue.snapshot()) != 0 {
			t.Fatalf("expected the process to be removed after being delivered, got %d items", len(queue.snapshot()))
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
