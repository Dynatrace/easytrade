package contentcreator

import (
	"context"
	"time"
)

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
