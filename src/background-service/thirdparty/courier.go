package thirdparty

import (
	"context"

	"dynatrace.com/easytrade/background-service/logger"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type courierQueue = queue[*CourierProcess]

func newCourierQueue() *courierQueue { return newQueue[*CourierProcess]() }

type courierRunner struct {
	queue *courierQueue
	svc   creditCardOrderService
}

func newCourierRunner(queue *courierQueue, svc creditCardOrderService) *courierRunner {
	return &courierRunner{queue: queue, svc: svc}
}

func (c *courierRunner) run(ctx context.Context) error {
	l := logger.GetSugar().Named("courier")
	l.Info("Running CourierScheduler task!")

	snapshot := c.queue.snapshot()
	var toRemove []*CourierProcess

	for _, p := range snapshot {
		switch p.Status {
		case NewCardReceived:
			c.processNewCardReceived(ctx, l, p)
		case CardSent:
			c.processCardSent(ctx, l, p)
		case CardDelivered:
			toRemove = append(toRemove, p)
			l.Info("All actions have been done, removing order information.")
		}
	}

	c.queue.remove(toRemove)
	l.Info("Finished CourierScheduler task!")
	return nil
}

func (c *courierRunner) processNewCardReceived(ctx context.Context, l *zap.SugaredLogger, p *CourierProcess) {
	addr, err := c.svc.GetShippingAddress(ctx, p.CreditCardOrderID)
	if err != nil {
		l.Errorw("Failed to fetch shipping address", "orderId", p.CreditCardOrderID, "err", err)
		return
	}
	if addr == nil {
		// Not found this tick — left untouched in the queue (no status
		// change, no removal)
		l.Infow("Could not find shipping address for order", "orderId", p.CreditCardOrderID)
		return
	}

	p.Address = addr
	id := uuid.NewString()
	p.ShippingID = id
	_ = c.svc.UpdateStatus(ctx, OrderCardShipped, p.CreditCardOrderID, ShippingIDBody{ShippingID: id})
	p.Status = CardSent
	l.Info("Card has been shipped to the customer.")
}

func (c *courierRunner) processCardSent(ctx context.Context, l *zap.SugaredLogger, p *CourierProcess) {
	_ = c.svc.UpdateStatus(ctx, OrderCardDelivered, p.CreditCardOrderID, nil)
	p.Status = CardDelivered
	l.Info("Card has been delivered to the customer.")
}
