package price

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

type price struct {
	Id           uuid.UUID `json:"id" xml:"id"`
	InstrumentId uuid.UUID `json:"instrumentId" xml:"instrumentId"`
	Timestamp    time.Time `json:"timestamp" xml:"timestamp"`
	Open         float64   `json:"open" xml:"open"`
	High         float64   `json:"high" xml:"high"`
	Low          float64   `json:"low" xml:"low"`
	Close        float64   `json:"close" xml:"close"`
}

type pricesResult struct {
	Results []price `json:"results" xml:"results"`
}

func (p *price) toCSV(volume int) string {
	return fmt.Sprintf("%s,%f,%f,%f,%f,%d\n", p.Timestamp.Format(time.RFC3339), p.Open, p.High, p.Low, p.Close, volume)
}
