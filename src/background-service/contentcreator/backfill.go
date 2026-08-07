package contentcreator

import (
	"context"
	"math/rand"
	"time"
)

func (h *Handler) runBackfill(ctx context.Context, anchor time.Time, minutes int) {
	l.Infow("Starting backfill", "anchor", anchor, "minutes", minutes)

	instruments := Instruments
	rng := rand.New(rand.NewSource(anchor.UnixNano() ^ 0x5bd1e995))
	t := anchor.Add(-1 * time.Minute)

	for range minutes {
		if err := h.insertPricingBatch(ctx, newCandlesForTime(instruments[:], t, rng)); err != nil {
			l.Errorw("Failed to insert backfill batch", "err", err)
		}
		t = t.Add(-1 * time.Minute)
	}

	l.Info("Backfill finished")
}
