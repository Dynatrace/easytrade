package aggregator

import (
	"context"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"net/http"
	"time"

	"dynatrace.com/easytrade/background-service/httpclient"
	"dynatrace.com/easytrade/background-service/logger"
)

const (
	signupEndpoint = "%s/api/signup"
	offersEndpoint = "%s/api/offers/%s"
)

type offerFormat int

const (
	jsonOfferFormat offerFormat = iota
	xmlOfferFormat
)

func (f offerFormat) mimeType() string {
	switch f {
	case jsonOfferFormat:
		return "application/json"
	case xmlOfferFormat:
		return "application/xml"
	default:
		return ""
	}
}

func (f offerFormat) parse(body []byte) (*Offer, error) {
	var offer Offer

	switch f {
	case jsonOfferFormat:
		if err := json.Unmarshal(body, &offer); err != nil {
			return nil, err
		}
	case xmlOfferFormat:
		if err := xml.Unmarshal(body, &offer); err != nil {
			return nil, err
		}
	default:
		return nil, fmt.Errorf("unsupported offer format %d", f)
	}

	return &offer, nil
}

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

type OfferResult struct {
	Offer           *Offer
	RequestDuration time.Duration
}

type OfferProvider interface {
	GetOffers(ctx context.Context, platformName, productFilter string, maxYearlyFeeFilter float32, format offerFormat) (*OfferResult, error)
}

type OfferServiceClient struct {
	baseURL string
	http    *httpclient.Client
}

func (c *OfferServiceClient) GetOffers(ctx context.Context, platformName, productFilter string, maxYearlyFeeFilter float32, format offerFormat) (*OfferResult, error) {
	l := logger.GetSugar().Named(platformName)

	url := fmt.Sprintf(offersEndpoint, c.baseURL, platformName)
	headers := map[string]string{"Accept": format.mimeType()}

	req, err := c.http.BuildRequest(ctx, http.MethodGet, url, headers, nil)
	if err != nil {
		l.Error(err)
		return nil, err
	}
	q := req.URL.Query()
	q.Add("productFilter", productFilter)
	q.Add("maxYearlyFeeFilter", fmt.Sprint(maxYearlyFeeFilter))
	req.URL.RawQuery = q.Encode()

	l.Infow("Sending offer request", "productFilter", productFilter, "maxYearlyFeeFilter", maxYearlyFeeFilter)

	start := time.Now()
	bodyText, resp, err := c.http.Send(req)
	duration := time.Since(start)
	if err != nil {
		l.Error(err)
		return nil, err
	}

	if err := httpclient.CheckStatus(resp, http.StatusOK); err != nil {
		l.Error(err)
		return nil, err
	}

	l.Infow("Received offer response", "duration", duration)

	offer, err := format.parse(bodyText)
	if err != nil {
		return nil, err
	}
	return &OfferResult{Offer: offer, RequestDuration: duration}, nil
}
