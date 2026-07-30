package price

import (
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestToCSV(t *testing.T) {
	ts := time.Date(2001, 1, 1, 1, 1, 1, 0, time.UTC)
	id := uuid.MustParse("00000000-0000-0000-0000-000000000001")
	p := price{
		Id:           id,
		InstrumentId: id,
		Timestamp:    ts,
		Open:         10.01,
		High:         10.01,
		Low:          10.01,
		Close:        10.01,
	}
	expected := "2001-01-01T01:01:01Z,10.010000,10.010000,10.010000,10.010000,137\n"
	csv := p.toCSV(137)

	if csv != expected {
		t.Errorf("The CSV does not generate correctly! Got: '%s' while expecting '%s'", csv, expected)
	}
}
