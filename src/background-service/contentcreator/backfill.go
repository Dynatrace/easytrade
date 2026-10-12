package contentcreator

import (
	"context"
	"time"

	proto "dynatrace.com/easytrade/background-service/proto"
)

const historyWindowMinutes = dailyPeriod / 2

func (h *Handler) backfillMissingHistory(ctx context.Context) {
	release, acquired := h.tryAcquireBackfill()
	if !acquired {
		l.Debug("Backfill already in progress, skipping check")
		return
	}
	defer release()

	pricesNewestFirst, err := h.fetchNewestPricesOfReferenceInstrument(ctx)
	if err != nil {
		l.Errorw("Failed to read pricing history", "err", err)
		return
	}

	missingMinutes := minutesMissingFromWindow(len(pricesNewestFirst))
	if missingMinutes <= 0 {
		return
	}

	h.runBackfill(ctx, backfillAnchor(pricesNewestFirst), missingMinutes)
}

func (h *Handler) tryAcquireBackfill() (release func(), acquired bool) {
	if !h.backfilling.CompareAndSwap(false, true) {
		return nil, false
	}
	return func() { h.backfilling.Store(false) }, true
}

func (h *Handler) fetchNewestPricesOfReferenceInstrument(ctx context.Context) ([]*proto.PriceMessage, error) {
	referenceInstrumentID := Instruments[0].ID
	limit := int32(historyWindowMinutes)
	resp, err := h.pricing.GetPricesForInstrument(ctx, &proto.GetPricesForInstrumentRequest{
		InstrumentId: referenceInstrumentID,
		Limit:        &limit,
	})
	return resp.GetPrices(), err
}

func minutesMissingFromWindow(existingCount int) int {
	return historyWindowMinutes - existingCount
}

func backfillAnchor(pricesNewestFirst []*proto.PriceMessage) time.Time {
	if len(pricesNewestFirst) == 0 {
		return time.Now().UTC()
	}
	return pricesNewestFirst[len(pricesNewestFirst)-1].GetTimestamp().AsTime()
}

func (h *Handler) runBackfill(ctx context.Context, anchor time.Time, minutes int) {
	l.Infow("Starting backfill", "anchor", anchor, "minutes", minutes)

	instruments := Instruments
	t := anchor.Add(-1 * time.Minute)

	for range minutes {
		if err := h.insertPricingBatch(ctx, newCandlesForTime(instruments[:], t, h.rng)); err != nil {
			l.Errorw("Failed to insert backfill batch", "err", err)
		}
		t = t.Add(-1 * time.Minute)
	}

	l.Info("Backfill finished")
}
