package contentcreator

import (
	"context"
	"testing"
	"time"

	"google.golang.org/protobuf/types/known/timestamppb"

	proto "dynatrace.com/easytrade/background-service/proto"
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

func priceRows(n int, newest time.Time) []*proto.PriceMessage {
	rows := make([]*proto.PriceMessage, n)
	for i := range rows {
		rows[i] = &proto.PriceMessage{Timestamp: timestamppb.New(newest.Add(-time.Duration(i) * time.Minute))}
	}
	return rows
}

func TestBackfillMissingHistory_EmptyTable_BackfillsFullWindow(t *testing.T) {
	h, pricing, _, _, _ := newTestHandler()

	h.backfillMissingHistory(context.Background())

	if pricing.insertCalls != historyWindowMinutes {
		t.Fatalf("expected %d batches, got %d", historyWindowMinutes, pricing.insertCalls)
	}
}

func TestBackfillMissingHistory_PartialHistory_BackfillsOnlyGapBeforeOldestRow(t *testing.T) {
	h, pricing, _, _, _ := newTestHandler()
	pricing.existing = priceRows(historyWindowMinutes-10, time.Now().UTC())
	oldest := pricing.existing[len(pricing.existing)-1].Timestamp.AsTime()

	h.backfillMissingHistory(context.Background())

	if pricing.insertCalls != 10 {
		t.Fatalf("expected 10 batches, got %d", pricing.insertCalls)
	}
	if got, want := pricing.insertedBatches[0][0].Timestamp.AsTime(), oldest.Add(-time.Minute); !got.Equal(want) {
		t.Fatalf("expected first batch at %v, got %v", want, got)
	}
}

func TestBackfillMissingHistory_CompleteHistory_InsertsNothing(t *testing.T) {
	h, pricing, _, _, _ := newTestHandler()
	pricing.existing = priceRows(historyWindowMinutes, time.Now().UTC())

	h.backfillMissingHistory(context.Background())

	if pricing.insertCalls != 0 {
		t.Fatalf("expected no inserts, got %d", pricing.insertCalls)
	}
}

func TestMinutesMissingFromWindow_VariousHistorySizes_ReturnsGapToWindow(t *testing.T) {
	cases := map[string]struct{ existing, want int }{
		"empty":    {0, historyWindowMinutes},
		"partial":  {historyWindowMinutes - 10, 10},
		"complete": {historyWindowMinutes, 0},
	}
	for name, c := range cases {
		t.Run(name, func(t *testing.T) {
			if got := minutesMissingFromWindow(c.existing); got != c.want {
				t.Fatalf("expected %d, got %d", c.want, got)
			}
		})
	}
}

func TestOldestPriceTimeOr_NoHistory_ReturnsFallback(t *testing.T) {
	fallback := time.Date(2026, 1, 1, 12, 0, 0, 0, time.UTC)

	if got := oldestPriceTimeOr(nil, fallback); !got.Equal(fallback) {
		t.Fatalf("expected %v, got %v", fallback, got)
	}
}

func TestOldestPriceTimeOr_WithHistory_ReturnsOldestTimestamp(t *testing.T) {
	newest := time.Date(2026, 1, 1, 12, 0, 0, 0, time.UTC)
	rows := priceRows(5, newest)

	if got, want := oldestPriceTimeOr(rows, time.Time{}), newest.Add(-4*time.Minute); !got.Equal(want) {
		t.Fatalf("expected %v, got %v", want, got)
	}
}
