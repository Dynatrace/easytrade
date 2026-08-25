package contentcreator

type Instrument struct {
	ID           string
	BasePrice    float64 // long-run equilibrium the OU walk reverts to
	Volatility   float64 // per-minute noise as fraction of price, e.g. 0.003
	Reversion    float64 // mean-reversion strength per minute, e.g. 0.005
	currentPrice float64 // unexported; initialized to BasePrice before first use
}

func newInstrument(id string, basePrice, volatility, reversion float64) Instrument {
	return Instrument{
		ID:           id,
		BasePrice:    basePrice,
		Volatility:   volatility,
		Reversion:    reversion,
		currentPrice: basePrice,
	}
}

var Instruments = [15]Instrument{
	newInstrument("c0000000-0000-4000-8000-000000000001", 150, 0.003, 0.005),    // EASYTRAVEL
	newInstrument("c0000000-0000-4000-8000-000000000002", 73, 0.003, 0.005),     // EASYPLANES
	newInstrument("c0000000-0000-4000-8000-000000000003", 25, 0.003, 0.005),     // EASYHOTELS
	newInstrument("c0000000-0000-4000-8000-000000000004", 0.217, 0.003, 0.005),  // JANGRP
	newInstrument("c0000000-0000-4000-8000-000000000005", 0.244, 0.003, 0.005),  // CORFIG
	newInstrument("c0000000-0000-4000-8000-000000000006", 2.174, 0.003, 0.005),  // CMRTIN
	newInstrument("c0000000-0000-4000-8000-000000000007", 1.127, 0.003, 0.005),  // CHAMAT
	newInstrument("c0000000-0000-4000-8000-000000000008", 10.021, 0.003, 0.005), // BLSTCR
	newInstrument("c0000000-0000-4000-8000-000000000009", 4.613, 0.003, 0.005),  // CAFGAL
	newInstrument("c0000000-0000-4000-8000-000000000010", 0.887, 0.003, 0.005),  // DECGRP
	newInstrument("c0000000-0000-4000-8000-000000000011", 4.095, 0.003, 0.005),  // PETBAN
	newInstrument("c0000000-0000-4000-8000-000000000012", 8.891, 0.003, 0.005),  // BATBAT
	newInstrument("c0000000-0000-4000-8000-000000000013", 0.462, 0.003, 0.005),  // STOLLC
	newInstrument("c0000000-0000-4000-8000-000000000014", 0.112, 0.003, 0.005),  // LEBRGA
	newInstrument("c0000000-0000-4000-8000-000000000015", 0.0997, 0.003, 0.005), // MOROBA
}
