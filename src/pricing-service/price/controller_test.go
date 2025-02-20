package price

import (
	"testing"

	"dynatrace.com/easytrade/pricing-service/utils"
)

func TestPrepareCSV(t *testing.T) {
	priceList := []price{
		{
			Id:           123,
			InstrumentId: 456,
			Timestamp:    "2001-01-01T01:01:01",
			Open:         10.01,
			High:         10.01,
			Low:          10.01,
			Close:        10.01,
		},
		{
			Id:           222,
			InstrumentId: 555,
			Timestamp:    "2002-02-02T02:02:02",
			Open:         20.02,
			High:         20.02,
			Low:          20.02,
			Close:        20.02,
		},
	}
	expected := "date, open, high, low, close, volume\n2001-01-01T01:01:01,10.010000,10.010000,10.010000,10.010000,200\n2002-02-02T02:02:02,20.020000,20.020000,20.020000,20.020000,200\n"
	csv := prepareCSV(priceList, utils.FakeIntProvider{})

	if csv != expected {
		t.Errorf("The CSV does not generate correctly! Got: '%s' while expecting '%s'", csv, expected)
	}
}
