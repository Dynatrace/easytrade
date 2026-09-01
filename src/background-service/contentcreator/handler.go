package contentcreator

import (
	"context"
	"math/rand"
	"time"

	"dynatrace.com/easytrade/background-service/config"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	proto "dynatrace.com/easytrade/background-service/proto"
)

const (
	dbAdapterServiceAddress = "DB_ADAPTER_SERVICE_ADDRESS"
)

type Handler struct {
	pricing proto.PricingServiceClient
	trade   proto.TradeServiceClient
	balance proto.BalanceServiceClient
	account proto.AccountServiceClient
	rng     *rand.Rand
}

func NewHandler(conn *grpc.ClientConn) *Handler {
	return &Handler{
		pricing: proto.NewPricingServiceClient(conn),
		trade:   proto.NewTradeServiceClient(conn),
		balance: proto.NewBalanceServiceClient(conn),
		account: proto.NewAccountServiceClient(conn),
		rng:     rand.New(rand.NewSource(time.Now().UnixNano())),
	}
}

func Start(ctx context.Context, values config.Values) {
	conn, err := grpc.NewClient(
		values.Get(dbAdapterServiceAddress),
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	)
	if err != nil {
		l.Errorw("Failed to connect to DB adapter service", "err", err)
		return
	}
	go func() {
		<-ctx.Done()
		conn.Close()
	}()

	h := NewHandler(conn)

	go func() {
		now := time.Now().UTC()
		h.initializePricingData(ctx, now)
		h.generatePricingData(ctx, now)
	}()
}

func (h *Handler) initializePricingData(ctx context.Context, now time.Time) {
	l.Infow("Inserting initial pricing data for current minute.")
	if err := h.insertPricingBatch(ctx, newCandlesForTime(Instruments[:], now, h.rng)); err != nil {
		l.Errorw("Failed to insert initial pricing data", "err", err)
	}

	l.Infow("Removing seed rows inserted before startup time", "before", now)
	if err := h.deletePricingBeforeDate(ctx, now); err != nil {
		l.Errorw("Failed to delete pre-startup seed rows", "err", err)
	}

	go h.runBackfill(ctx, now, dailyPeriod/2)
}

func (h *Handler) generatePricingData(ctx context.Context, now time.Time) {
	hourly := newTicker(cleanupInterval, func() { h.doEachHour(ctx, staleAfter) })
	daily := newTicker(dailyPeriod, func() { h.doEachDay(ctx) })

	for {
		now = now.Add(time.Minute)
		h.insertPricingBatch(ctx, newCandlesForTime(Instruments[:], now, h.rng))
		hourly.tick()
		daily.tick()
		sleepProperly(now, time.Minute)
	}
}

func (h *Handler) doEachDay(ctx context.Context) {
	l.Info("Generator is running for a whole day. Running daily tasks.")

	if err := h.deletePricingBeforeDate(ctx, time.Now().UTC().AddDate(0, 0, -1)); err != nil {
		l.Errorw("Failed to remove old pricing data", "err", err)
	}
}

func (h *Handler) doEachHour(ctx context.Context, staleAfter time.Duration) {
	l.Info("Running hourly stale-data cleanup.")

	cutoff := time.Now().UTC().Add(-staleAfter)

	if err := h.deleteTradesBeforeDate(ctx, cutoff); err != nil {
		l.Errorw("Failed to remove stale trades", "err", err)
	}

	if err := h.deleteBalanceHistoryBeforeDate(ctx, cutoff); err != nil {
		l.Errorw("Failed to remove stale balance history", "err", err)
	}

	if err := h.deleteStaleAccounts(ctx, cutoff); err != nil {
		l.Errorw("Failed to remove stale accounts", "err", err)
	}
}
