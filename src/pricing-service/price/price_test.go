package price

import (
	"testing"
)

func TestToCSV(t *testing.T) {
	p := price{
		Id:           123,
		InstrumentId: 456,
		Timestamp:    "2001-01-01T01:01:01",
		Open:         10.01,
		High:         10.01,
		Low:          10.01,
		Close:        10.01,
	}
	expected := "2001-01-01T01:01:01,10.010000,10.010000,10.010000,10.010000,137\n"
	csv := p.toCSV(137)

	if csv != expected {
		t.Errorf("The CSV does not generate correctly! Got: '%s' while expecting '%s'", csv, expected)
	}
}
