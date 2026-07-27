package contentcreator

import (
	"math"
	"math/rand"
	"time"
)

type pricingRow struct {
	Timestamp    time.Time
	InstrumentID int
	Open         float64
	High         float64
	Low          float64
	Close        float64
}

func interpolate(secOfDay int, instr Instrument) float64 {
	switch {
	case secOfDay == secH0 || secOfDay == secH24:
		return instr.Time0
	case secOfDay <= secH3:
		return lerp(instr.Time0, instr.Time3, secOfDay, secH0)
	case secOfDay <= secH6:
		return lerp(instr.Time3, instr.Time6, secOfDay, secH3)
	case secOfDay <= secH9:
		return lerp(instr.Time6, instr.Time9, secOfDay, secH6)
	case secOfDay <= secH12:
		return lerp(instr.Time9, instr.Time12, secOfDay, secH9)
	case secOfDay <= secH15:
		return lerp(instr.Time12, instr.Time15, secOfDay, secH12)
	case secOfDay <= secH18:
		return lerp(instr.Time15, instr.Time18, secOfDay, secH15)
	case secOfDay <= secH21:
		return lerp(instr.Time18, instr.Time21, secOfDay, secH18)
	default:
		return lerp(instr.Time21, instr.Time0, secOfDay, secH21)
	}
}

func lerp(start, end float64, secOfDay, sectionStart int) float64 {
	step := (end - start) / secH3
	return start + step*float64(secOfDay-sectionStart)
}

func generateCandle(secOfDay int, instr Instrument, rng *rand.Rand) pricingRow {
	opening := interpolate(secOfDay, instr)
	closing := interpolate(secOfDay+60, instr)

	difference := math.Max(closing-opening, instr.BaseDifference)

	high, low := math.Max(opening, closing), math.Min(opening, closing)
	for i := 0; i < 60; i++ {
		v := opening + ((rng.Float64()*4)-2.0)*difference
		if v > high {
			high = v
		}
		if v < low {
			low = v
		}
	}

	return pricingRow{InstrumentID: instr.ID, Open: opening, High: high, Low: low, Close: closing}
}

func generateAllForTime(t time.Time, rng *rand.Rand) []pricingRow {
	secOfDay := t.Hour()*3600 + t.Minute()*60
	rows := make([]pricingRow, len(Instruments))
	for i, instr := range Instruments {
		row := generateCandle(secOfDay, instr, rng)
		row.Timestamp = t
		rows[i] = row
	}
	return rows
}
