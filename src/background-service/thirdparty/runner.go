package thirdparty

import (
	"context"
	"fmt"
	"math/rand"
	"time"

	"dynatrace.com/easytrade/background-service/logger"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type runner struct {
	incoming chan *Order
	orders   []*Order

	svc                creditCardOrderService
	flags              flagChecker
	delayChancePercent int
	rng                *rand.Rand
}

func newRunner(svc creditCardOrderService, flags flagChecker, delayChancePercent int) *runner {
	return &runner{
		incoming:           make(chan *Order, 100),
		svc:                svc,
		flags:              flags,
		delayChancePercent: delayChancePercent,
		rng:                rand.New(rand.NewSource(time.Now().UnixNano())),
	}
}

func (r *runner) Submit(req CreditCardRequest) {
	r.incoming <- &Order{Request: req, Status: OrderCardOrdered}
}

func (r *runner) loop(ctx context.Context, initialDelay time.Duration, rateSeconds int) {
	select {
	case <-time.After(initialDelay):
	case <-ctx.Done():
		return
	}

	for ctx.Err() == nil {
		r.drainIncoming()
		r.tick(ctx)
		r.jitterSleep(rateSeconds)
	}
}

func (r *runner) jitterSleep(rateSeconds int) {
	extra := r.rng.Intn(rateSeconds)
	time.Sleep(time.Duration(rateSeconds+extra) * time.Second)
}

func (r *runner) drainIncoming() {
	for {
		select {
		case o := <-r.incoming:
			r.orders = append(r.orders, o)
		default:
			return
		}
	}
}

func (r *runner) tick(ctx context.Context) {
	l := logger.GetSugar().Named("thirdparty")

	keep := r.orders[:0]
	for _, o := range r.orders {
		switch o.Status {
		case OrderCardOrdered, OrderCardError:
			r.processManufacture(ctx, l, o)
		case OrderCardCreated:
			r.processShipping(ctx, l, o)
		case OrderCardShipped:
			r.processDelivery(ctx, l, o)
		}
		if o.Status != OrderCardDelivered {
			keep = append(keep, o)
		}
	}
	r.orders = keep
}

func (r *runner) processManufacture(ctx context.Context, l *zap.SugaredLogger, o *Order) {
	crisis := r.flags.GetBool(ctx, "factory_crisis", false)

	if crisis {
		// Dedup guard, load-bearing: only act the FIRST tick an order enters
		// CARD_ERROR while the crisis flag stays true. Without this, every
		// tick during a sustained crisis would re-POST CARD_ERROR for every
		// order already sitting in the error state.
		if o.Status != OrderCardError {
			l.Info("There is a problem in factory and all credit cards fail right now!")
			if err := r.svc.UpdateStatus(ctx, OrderCardError, o.Request.CreditCardOrderID, FactoryFailure); err != nil {
				l.Errorw("Failed to report factory crisis to credit card order service", "orderId", o.Request.CreditCardOrderID, "err", err)
				return
			}
			o.Status = OrderCardError
			l.Info("Delay information has been passed to the credit card order service.")
		}
		return
	}

	if r.rng.Intn(100) < r.delayChancePercent {
		errBody := DelayOnChips
		if r.rng.Intn(2) == 0 {
			errBody = FactoryFailure
		}
		l.Info("There was a delay during card creation!")
		if err := r.svc.UpdateStatus(ctx, OrderCardError, o.Request.CreditCardOrderID, errBody); err != nil {
			l.Errorw("Failed to report card creation delay to credit card order service", "orderId", o.Request.CreditCardOrderID, "err", err)
			return
		}
		o.Status = OrderCardError
		l.Info("Delay information has been passed to the credit card order service.")
		return
	}

	card := r.generateCardDetails(o.Request.CardLevel)
	o.CardDetails = &card
	l.Info("Card has been created!")
	if err := r.svc.UpdateStatus(ctx, OrderCardCreated, o.Request.CreditCardOrderID, card); err != nil {
		l.Errorw("Failed to report card creation to credit card order service", "orderId", o.Request.CreditCardOrderID, "err", err)
		return
	}
	o.Status = OrderCardCreated
	l.Info("Card details and status has been updated in credit card order service.")
}

func (r *runner) generateCardDetails(cardLevel string) CreditCardBody {
	return CreditCardBody{
		CardLevel:     cardLevel,
		CardNumber:    fmt.Sprintf("%05d%06d%05d", r.rng.Intn(100000), r.rng.Intn(1000000), r.rng.Intn(100000)),
		CardCVS:       fmt.Sprintf("%03d", r.rng.Intn(1000)),
		CardValidDate: time.Now().AddDate(3, 0, 0),
	}
}

func (r *runner) processShipping(ctx context.Context, l *zap.SugaredLogger, o *Order) {
	addr, err := r.svc.GetShippingAddress(ctx, o.Request.CreditCardOrderID)
	if err != nil {
		l.Errorw("Failed to fetch shipping address", "orderId", o.Request.CreditCardOrderID, "err", err)
		return
	}
	if addr == nil {
		// Not found this tick — left untouched (no status change), retried
		// on a later tick.
		l.Infow("Could not find shipping address for order", "orderId", o.Request.CreditCardOrderID)
		return
	}

	o.Address = addr
	id := uuid.NewString()
	o.ShippingID = id
	_ = r.svc.UpdateStatus(ctx, OrderCardShipped, o.Request.CreditCardOrderID, ShippingIDBody{ShippingID: id})
	o.Status = OrderCardShipped
	l.Info("Card has been shipped to the customer.")
}

func (r *runner) processDelivery(ctx context.Context, l *zap.SugaredLogger, o *Order) {
	_ = r.svc.UpdateStatus(ctx, OrderCardDelivered, o.Request.CreditCardOrderID, nil)
	o.Status = OrderCardDelivered
	l.Info("Card has been delivered to the customer.")
}
