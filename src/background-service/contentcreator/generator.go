package contentcreator

import (
	"math"
	"math/rand"
	"time"
)

type candle struct {
	Timestamp    time.Time
	InstrumentID string
	Open         float64
	High         float64
	Low          float64
	Close        float64
}

func (instr *Instrument) newCandle(rng *rand.Rand) candle {
	open := instr.currentPrice

	drift := instr.Reversion * (instr.BasePrice - instr.currentPrice)
	noise := instr.Volatility * instr.currentPrice * rng.NormFloat64()
	close := open + drift + noise

	wickScale := instr.Volatility * instr.currentPrice
	high := math.Max(open, close) + math.Abs(rng.NormFloat64())*wickScale
	low := math.Min(open, close) - math.Abs(rng.NormFloat64())*wickScale

	instr.currentPrice = close
	return candle{InstrumentID: instr.ID, Open: open, High: high, Low: low, Close: close}
}


func newCandlesForTime(instruments []Instrument, cal time.Time, rng *rand.Rand) []candle {
	candles := make([]candle, len(instruments))
	for i := range instruments {
		c := instruments[i].newCandle(rng)
		c.Timestamp = cal
		candles[i] = c
	}
	return candles
}
