package contentcreator

import (
	"context"
	"testing"
	"time"
)

// TestRunBackfill_InsertsOneBatchPerMinute mirrors runBackfill's contract:
// it must issue exactly one InsertPricesBatch call per requested minute.
func TestRunBackfill_InsertsOneBatchPerMinute(t *testing.T) {
	h, pricing, _, _, _ := newTestHandler()
	anchor := time.Date(2026, 1, 1, 12, 0, 0, 0, time.UTC)

	h.runBackfill(context.Background(), anchor, 5)

	if pricing.insertCalls != 5 {
		t.Fatalf("expected 5 InsertPricesBatch calls, got %d", pricing.insertCalls)
	}
}

// TestRunBackfill_EachBatchCoversAllInstruments guards the row count per
// batch: every minute's batch must contain one row per instrument.
func TestRunBackfill_EachBatchCoversAllInstruments(t *testing.T) {
	h, pricing, _, _, _ := newTestHandler()
	anchor := time.Date(2026, 1, 1, 12, 0, 0, 0, time.UTC)

	h.runBackfill(context.Background(), anchor, 3)

	for i, batch := range pricing.insertedBatches {
		if len(batch) != len(Instruments) {
			t.Fatalf("batch %d: expected %d rows, got %d", i, len(Instruments), len(batch))
		}
	}
}

// TestRunBackfill_WalksStrictlyBackwardsFromAnchor asserts each successive
// batch's timestamp is exactly one minute earlier than the previous, starting
// one minute before anchor (never re-inserting the anchor minute itself).
func TestRunBackfill_WalksStrictlyBackwardsFromAnchor(t *testing.T) {
	h, pricing, _, _, _ := newTestHandler()
	anchor := time.Date(2026, 1, 1, 12, 0, 0, 0, time.UTC)

	h.runBackfill(context.Background(), anchor, 4)

	want := anchor.Add(-1 * time.Minute)
	for i, batch := range pricing.insertedBatches {
		got := batch[0].Timestamp.AsTime()
		if !got.Equal(want) {
			t.Fatalf("batch %d: expected timestamp %v, got %v", i, want, got)
		}
		want = want.Add(-1 * time.Minute)
	}
}

// TestRunBackfill_DeterministicGivenSameAnchor relies on newTestHandler
// seeding every Handler.rng identically: calling runBackfill twice with the
// same anchor on separately constructed handlers must produce identical
// candle values, not just identical shape.
func TestRunBackfill_DeterministicGivenSameAnchor(t *testing.T) {
	h1, pricing1, _, _, _ := newTestHandler()
	h2, pricing2, _, _, _ := newTestHandler()
	anchor := time.Date(2026, 1, 1, 12, 0, 0, 0, time.UTC)

	h1.runBackfill(context.Background(), anchor, 2)
	h2.runBackfill(context.Background(), anchor, 2)

	if len(pricing1.insertedBatches) != len(pricing2.insertedBatches) {
		t.Fatalf("expected same number of batches, got %d vs %d", len(pricing1.insertedBatches), len(pricing2.insertedBatches))
	}
	for i := range pricing1.insertedBatches {
		for j := range pricing1.insertedBatches[i] {
			a, b := pricing1.insertedBatches[i][j], pricing2.insertedBatches[i][j]
			if a.Open != b.Open || a.Close != b.Close {
				t.Fatalf("batch %d row %d: expected deterministic candle, got open %v/%v close %v/%v", i, j, a.Open, b.Open, a.Close, b.Close)
			}
		}
	}
}
