package price

import (
	"fmt"
)

func (price) TableName() string {
	return "Pricing"
}

type price struct {
	Id           int      `json:"id" xml:"id"`
	InstrumentId int      `json:"instrumentId" xml:"instrumentId"`
	Timestamp    string   `json:"timestamp" xml:"timestamp"`
	Open         float64  `json:"open" xml:"open"`
	High         float64  `json:"high" xml:"high"`
	Low          float64  `json:"low" xml:"low"`
	Close        float64  `json:"close" xml:"close"`
}

type pricesResult struct {
	Results []price `json:"results" xml:"results"`
}

func (p *price) toCSV(volume int) string {
	return fmt.Sprintf("%s,%f,%f,%f,%f,%d\n", p.Timestamp, p.Open, p.High, p.Low, p.Close, volume)
}
