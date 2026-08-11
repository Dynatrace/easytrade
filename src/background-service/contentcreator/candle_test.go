package contentcreator

import (
	"math/rand"
	"testing"
	"time"
)

// TestNewCandle_SetsTimestamp guards newCandle's self-containment: the
// returned candle must carry the timestamp it was given, not a zero value
// left for the caller to fill in.
func TestNewCandle_SetsTimestamp(t *testing.T) {
	rng := rand.New(rand.NewSource(1))
	instr := newInstrument("test-instrument", 100, 0.003, 0.005)
	now := time.Now().UTC()

	c := instr.newCandle(now, rng)

	if !c.Timestamp.Equal(now) {
		t.Fatalf("expected candle timestamp %v, got %v", now, c.Timestamp)
	}
}

// TestNewCandle_OpenChainsFromPreviousClose asserts each candle's open equals
// the instrument's price left off by the previous candle's close — the OU
// walk must continue from where it left off, not reset.
func TestNewCandle_OpenChainsFromPreviousClose(t *testing.T) {
	rng := rand.New(rand.NewSource(1))
	instr := newInstrument("test-instrument", 100, 0.003, 0.005)
	now := time.Now().UTC()

	first := instr.newCandle(now, rng)
	second := instr.newCandle(now.Add(time.Minute), rng)

	if second.Open != first.Close {
		t.Fatalf("expected second candle's open (%v) to equal first candle's close (%v)", second.Open, first.Close)
	}
}

// TestNewCandle_HighLowBoundOpenClose mirrors the high/low randomness check:
// high must never be below open/close, low must never be above them.
func TestNewCandle_HighLowBoundOpenClose(t *testing.T) {
	rng := rand.New(rand.NewSource(42))
	now := time.Now().UTC()

	for _, base := range Instruments {
		instr := newInstrument(base.ID, base.BasePrice, base.Volatility, base.Reversion)
		for i := 0; i < 24; i++ {
			c := instr.newCandle(now.Add(time.Duration(i)*time.Minute), rng)
			if c.High < c.Open || c.High < c.Close {
				t.Fatalf("instrument %s tick %d: high %v below open/close (%v/%v)", base.ID, i, c.High, c.Open, c.Close)
			}
			if c.Low > c.Open || c.Low > c.Close {
				t.Fatalf("instrument %s tick %d: low %v above open/close (%v/%v)", base.ID, i, c.Low, c.Open, c.Close)
			}
		}
	}
}

// TestNewCandle_ReturnsInstrumentID guards the InstrumentID plumbing: the
// candle must carry the originating instrument's ID unchanged.
func TestNewCandle_ReturnsInstrumentID(t *testing.T) {
	rng := rand.New(rand.NewSource(7))
	instr := newInstrument("c0000000-0000-4000-8000-000000000099", 50, 0.003, 0.005)

	c := instr.newCandle(time.Now().UTC(), rng)

	if c.InstrumentID != instr.ID {
		t.Fatalf("expected InstrumentID %q, got %q", instr.ID, c.InstrumentID)
	}
}

// TestNewCandle_RevertsTowardBasePriceOnAverage asserts the mean-reversion
// drift term: displaced far from BasePrice with volatility disabled, the walk
// must always step back toward BasePrice rather than away from it.
func TestNewCandle_RevertsTowardBasePriceOnAverage(t *testing.T) {
	rng := rand.New(rand.NewSource(3))
	instr := newInstrument("test-instrument", 100, 0, 0.005)
	instr.currentPrice = 200

	c := instr.newCandle(time.Now().UTC(), rng)

	if c.Close >= 200 {
		t.Fatalf("expected close (%v) to move below displaced price 200 toward BasePrice 100", c.Close)
	}
	if c.Close < 100 {
		t.Fatalf("expected close (%v) not to overshoot past BasePrice 100 in a single tick", c.Close)
	}
}

// TestNewCandlesForTime_MutatesInstrumentsByIndexNotCopy guards against the
// classic range-over-array bug: newCandlesForTime must persist each
// instrument's currentPrice across calls, not silently reset it every tick.
func TestNewCandlesForTime_MutatesInstrumentsByIndexNotCopy(t *testing.T) {
	instruments := []Instrument{newInstrument("test-instrument", 100, 0.05, 0.005)}

	rng := rand.New(rand.NewSource(9))
	now := time.Now().UTC()

	first := newCandlesForTime(instruments, now, rng)
	second := newCandlesForTime(instruments, now, rng)

	if second[0].Open != first[0].Close {
		t.Fatalf("expected second batch's open (%v) to continue from first batch's close (%v); currentPrice was not persisted across calls", second[0].Open, first[0].Close)
	}
}
