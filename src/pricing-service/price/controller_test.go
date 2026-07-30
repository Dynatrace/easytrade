package price

import (
	"testing"
	"time"

	"dynatrace.com/easytrade/pricing-service/utils"
	"github.com/google/uuid"
)

func TestPrepareCSV(t *testing.T) {
	ts1 := time.Date(2001, 1, 1, 1, 1, 1, 0, time.UTC)
	ts2 := time.Date(2002, 2, 2, 2, 2, 2, 0, time.UTC)
	priceList := []price{
		{
			Id:           uuid.MustParse("00000000-0000-0000-0000-000000000001"),
			InstrumentId: uuid.MustParse("00000000-0000-0000-0000-000000000456"),
			Timestamp:    ts1,
			Open:         10.01,
			High:         10.01,
			Low:          10.01,
			Close:        10.01,
		},
		{
			Id:           uuid.MustParse("00000000-0000-0000-0000-000000000002"),
			InstrumentId: uuid.MustParse("00000000-0000-0000-0000-000000000555"),
			Timestamp:    ts2,
			Open:         20.02,
			High:         20.02,
			Low:          20.02,
			Close:        20.02,
		},
	}
	expected := "date, open, high, low, close, volume\n2001-01-01T01:01:01Z,10.010000,10.010000,10.010000,10.010000,200\n2002-02-02T02:02:02Z,20.020000,20.020000,20.020000,20.020000,200\n"
	csv := prepareCSV(priceList, utils.FakeIntProvider{})

	if csv != expected {
		t.Errorf("The CSV does not generate correctly! Got: '%s' while expecting '%s'", csv, expected)
	}
}
