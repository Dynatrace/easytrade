package contentcreator

import (
	"math/rand"
	"testing"
)

// TestGenerateCandle_ContinuityBetweenMinutes mirrors
// PricingDataGeneratorTest's continuity check: consecutive minutes' candles
// must chain (this minute's close == next minute's open), since both are
// computed from the same underlying interpolation at adjacent seconds.
func TestGenerateCandle_ContinuityBetweenMinutes(t *testing.T) {
	rng := rand.New(rand.NewSource(1))
	instr := Instruments[0]

	for sec := 0; sec < 86400; sec += 60 {
		a := generateCandle(sec, instr, rng)
		b := generateCandle((sec+60)%86400, instr, rng)
		if a.Close != b.Open {
			t.Fatalf("expected candle close to chain into next candle's open at sec=%d: close=%v, nextOpen=%v", sec, a.Close, b.Open)
		}
	}
}

// TestGenerateCandle_AnchorPointsExact mirrors the anchor-point exactness
// check: at exactly H0, the interpolated price must equal the instrument's
// Time0 anchor with no interpolation error.
func TestGenerateCandle_AnchorPointsExact(t *testing.T) {
	for _, instr := range Instruments {
		if got := interpolate(secH0, instr); got != instr.Time0 {
			t.Fatalf("instrument %d: expected H0 to equal Time0 (%v), got %v", instr.ID, instr.Time0, got)
		}
		if got := interpolate(secH24, instr); got != instr.Time0 {
			t.Fatalf("instrument %d: expected H24 to wrap to Time0 (%v), got %v", instr.ID, instr.Time0, got)
		}
		if got := interpolate(secH3, instr); got != instr.Time3 {
			t.Fatalf("instrument %d: expected H3 to equal Time3 (%v), got %v", instr.ID, instr.Time3, got)
		}
	}
}

// TestGenerateCandle_HighLowBoundOpenClose mirrors the high/low randomness
// check: high must never be below open/close, low must never be above them.
func TestGenerateCandle_HighLowBoundOpenClose(t *testing.T) {
	rng := rand.New(rand.NewSource(42))
	for _, instr := range Instruments {
		for sec := 0; sec < 86400; sec += 3600 {
			c := generateCandle(sec, instr, rng)
			if c.High < c.Open || c.High < c.Close {
				t.Fatalf("instrument %d sec %d: high %v below open/close (%v/%v)", instr.ID, sec, c.High, c.Open, c.Close)
			}
			if c.Low > c.Open || c.Low > c.Close {
				t.Fatalf("instrument %d sec %d: low %v above open/close (%v/%v)", instr.ID, sec, c.Low, c.Open, c.Close)
			}
		}
	}
}
