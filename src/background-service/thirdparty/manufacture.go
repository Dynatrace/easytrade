package thirdparty

import (
	"context"
	"fmt"
	"math/rand"
	"sync"
	"time"

	"dynatrace.com/easytrade/background-service/logger"
	"go.uber.org/zap"
)

const manufactureDelayChancePercent = "MANUFACTURE_DELAY_CHANCE_PERCENT"

type manufactureQueue = queue[*ManufactureProcess]

func newManufactureQueue() *manufactureQueue { return newQueue[*ManufactureProcess]() }

type manufactureRunner struct {
	queue              *manufactureQueue
	courierQueue       *courierQueue
	svc                creditCardOrderService
	flags              flagChecker
	delayChancePercent int

	rngMu sync.Mutex
	rng   *rand.Rand
}

func newManufactureRunner(queue *manufactureQueue, courierQueue *courierQueue, svc creditCardOrderService, flags flagChecker, delayChancePercent int) *manufactureRunner {
	return &manufactureRunner{
		queue:              queue,
		courierQueue:       courierQueue,
		svc:                svc,
		flags:              flags,
		delayChancePercent: delayChancePercent,
		rng:                rand.New(rand.NewSource(time.Now().UnixNano())),
	}
}

func (m *manufactureRunner) randIntN(n int) int {
	m.rngMu.Lock()
	defer m.rngMu.Unlock()
	return m.rng.Intn(n)
}

func (m *manufactureRunner) run(ctx context.Context) error {
	l := logger.GetSugar().Named("manufacture")
	l.Info("Running ManufactureScheduler task!")

	snapshot := m.queue.snapshot()
	var toRemove []*ManufactureProcess

	for _, p := range snapshot {
		switch p.Status {
		case Issuing, ManufactureError:
			m.processIssueAndErrorStatus(ctx, l, p)
		case CardCreated:
			m.courierQueue.add(&CourierProcess{CreditCardOrderID: p.Request.CreditCardOrderID, Status: NewCardReceived})
			toRemove = append(toRemove, p)
			l.Info("Card has been sent to the courier service.")
		}
	}

	m.queue.remove(toRemove)
	l.Info("Finished ManufactureScheduler task!")
	return nil
}

func (m *manufactureRunner) processIssueAndErrorStatus(ctx context.Context, l *zap.SugaredLogger, p *ManufactureProcess) {
	crisis := m.flags.GetBool(ctx, "factory_crisis", false)

	if crisis {
		// Dedup guard, load-bearing: only act the FIRST tick a process enters
		// MANUFACTURE_ERROR while the crisis flag stays true. Without this,
		// every tick during a sustained crisis would re-POST CARD_ERROR for
		// every process already sitting in the error state.
		if p.Status != ManufactureError {
			l.Info("There is a problem in factory and all credit cards fail right now!")
			if err := m.svc.UpdateStatus(ctx, OrderCardError, p.Request.CreditCardOrderID, FactoryFailure); err != nil {
				l.Errorw("Failed to report factory crisis to credit card order service", "orderId", p.Request.CreditCardOrderID, "err", err)
				return
			}
			p.Status = ManufactureError
			l.Info("Delay information has been passed to the credit card order service.")
		}
		return
	}

	if m.randIntN(100) < m.delayChancePercent {
		errBody := DelayOnChips
		if m.randIntN(2) == 0 {
			errBody = FactoryFailure
		}
		l.Info("There was a delay during card creation!")
		if err := m.svc.UpdateStatus(ctx, OrderCardError, p.Request.CreditCardOrderID, errBody); err != nil {
			l.Errorw("Failed to report card creation delay to credit card order service", "orderId", p.Request.CreditCardOrderID, "err", err)
			return
		}
		p.Status = ManufactureError
		l.Info("Delay information has been passed to the credit card order service.")
		return
	}

	card := m.generateCardDetails(p.Request.CardLevel)
	p.CardDetails = &card
	l.Info("Card has been created!")
	if err := m.svc.UpdateStatus(ctx, OrderCardCreated, p.Request.CreditCardOrderID, card); err != nil {
		l.Errorw("Failed to report card creation to credit card order service", "orderId", p.Request.CreditCardOrderID, "err", err)
		return
	}
	p.Status = CardCreated
	l.Info("Card details and status has been updated in credit card order service.")
}

func (m *manufactureRunner) generateCardDetails(cardLevel string) CreditCardBody {
	return CreditCardBody{
		CardLevel:     cardLevel,
		CardNumber:    fmt.Sprintf("%05d%06d%05d", m.randIntN(100000), m.randIntN(1000000), m.randIntN(100000)),
		CardCVS:       fmt.Sprintf("%03d", m.randIntN(1000)),
		CardValidDate: time.Now().AddDate(3, 0, 0),
	}
}
