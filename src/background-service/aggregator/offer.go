package aggregator

import (
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io"
	"net/http"
	"time"

	"dynatrace.com/easytrade/background-service/logger"
)

const (
	jsonMimeType = "application/json"
	xmlMimeType  = "application/xml"
)

type Offer struct {
	Platform string         `xml:"platform" json:"platform"`
	QuoteFor string         `xml:"quoteFor" json:"quoteFor"`
	Packages []offerPackage `xml:"packages" json:"packages"`
	Products []offerProduct `xml:"products" json:"products"`
}

type offerPackage struct {
	Id      int     `xml:"id" json:"id"`
	Name    string  `xml:"name" json:"name"`
	Price   float32 `xml:"price" json:"price"`
	Support string  `xml:"support" json:"support"`
}

type offerProduct struct {
	Id       int     `xml:"id" json:"id"`
	Name     string  `xml:"name" json:"name"`
	Ppt      float32 `xml:"ppt" json:"ppt"`
	Currency string  `xml:"currency" json:"currency"`
}

type offerXML struct {
	Offer
	XMLName xml.Name `xml:"offer"`
}

type OfferResult struct {
	Offer           *Offer
	RequestDuration time.Duration
}

type OfferProvider interface {
	GetOffersJSON(platformName, productFilter string, maxYearlyFeeFilter float32) (*OfferResult, error)
	GetOffersXML(platformName, productFilter string, maxYearlyFeeFilter float32) (*OfferResult, error)
}

type OfferServiceConnector struct {
	baseURL string
}

func (c *OfferServiceConnector) GetOffersJSON(platformName, productFilter string, maxYearlyFeeFilter float32) (*OfferResult, error) {
	return c.getOffers(platformName, productFilter, maxYearlyFeeFilter, jsonMimeType)
}

func (c *OfferServiceConnector) GetOffersXML(platformName, productFilter string, maxYearlyFeeFilter float32) (*OfferResult, error) {
	return c.getOffers(platformName, productFilter, maxYearlyFeeFilter, xmlMimeType)
}

func (c *OfferServiceConnector) getOffers(platformName, productFilter string, maxYearlyFeeFilter float32, mimeType string) (*OfferResult, error) {
	l := logger.GetSugar().Named(platformName)

	url := fmt.Sprintf("%s/api/offers/%s", c.baseURL, platformName)
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		l.Error(err)
		return nil, err
	}
	req.Header.Set("Accept", mimeType)
	q := req.URL.Query()
	q.Add("productFilter", productFilter)
	q.Add("maxYearlyFeeFilter", fmt.Sprint(maxYearlyFeeFilter))
	req.URL.RawQuery = q.Encode()

	l.Infow("Sending offer request", "productFilter", productFilter, "maxYearlyFeeFilter", maxYearlyFeeFilter)

	start := time.Now()
	resp, err := http.DefaultClient.Do(req)
	duration := time.Since(start)
	if err != nil {
		l.Error(err)
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		err := fmt.Errorf("unexpected status code %d, expected 200", resp.StatusCode)
		l.Error(err)
		return nil, err
	}

	l.Infow("Received offer response", "duration", duration)

	bodyText, err := io.ReadAll(resp.Body)
	if err != nil {
		l.Error(err)
		return nil, err
	}

	offer, err := parseOfferResponse(bodyText, mimeType)
	if err != nil {
		return nil, err
	}
	return &OfferResult{Offer: offer, RequestDuration: duration}, nil
}

func parseOfferResponse(body []byte, mimeType string) (*Offer, error) {
	switch mimeType {
	case jsonMimeType:
		var offer Offer
		if err := json.Unmarshal(body, &offer); err != nil {
			return nil, err
		}
		return &offer, nil
	case xmlMimeType:
		var wrapper offerXML
		if err := xml.Unmarshal(body, &wrapper); err != nil {
			return nil, err
		}
		return &wrapper.Offer, nil
	default:
		return nil, fmt.Errorf("unsupported mime type %q", mimeType)
	}
}
