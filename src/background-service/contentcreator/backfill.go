package contentcreator

import (
	"context"
	"time"

	proto "dynatrace.com/easytrade/background-service/proto"
)

const historyWindowMinutes = dailyPeriod / 2

func (h *Handler) backfillMissingHistory(ctx context.Context) {
	if !h.backfilling.CompareAndSwap(false, true) {
		l.Debug("Backfill already in progress, skipping check")
		return
	}
	defer h.backfilling.Store(false)

	pricesNewestFirst, err := h.fetchNewestPricesOfReferenceInstrument(ctx)
	if err != nil {
		l.Errorw("Failed to read pricing history", "err", err)
		return
	}

	missingMinutes := historyWindowMinutes - len(pricesNewestFirst)
	if missingMinutes <= 0 {
		return
	}

	backfillAnchor := time.Now().UTC()
	if len(pricesNewestFirst) > 0 {
		backfillAnchor = pricesNewestFirst[len(pricesNewestFirst)-1].GetTimestamp().AsTime()
	}

	h.runBackfill(ctx, backfillAnchor, missingMinutes)
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
