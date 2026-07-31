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
	jsonMimeType   = "application/json"
	xmlMimeType    = "application/xml"
	signupEndpoint = "%s/api/signup"
	offersEndpoint = "%s/api/offers/%s"
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

type OfferResult struct {
	Offer           *Offer
	RequestDuration time.Duration
}

type OfferProvider interface {
	GetOffersJSON(ctx context.Context, platformName, productFilter string, maxYearlyFeeFilter float32) (*OfferResult, error)
	GetOffersXML(ctx context.Context, platformName, productFilter string, maxYearlyFeeFilter float32) (*OfferResult, error)
}

type OfferServiceClient struct {
	baseURL string
	http    *httpclient.Client
}

func (c *OfferServiceClient) GetOffersJSON(ctx context.Context, platformName, productFilter string, maxYearlyFeeFilter float32) (*OfferResult, error) {
	return c.getOffers(ctx, platformName, productFilter, maxYearlyFeeFilter, jsonMimeType)
}

func (c *OfferServiceClient) GetOffersXML(ctx context.Context, platformName, productFilter string, maxYearlyFeeFilter float32) (*OfferResult, error) {
	return c.getOffers(ctx, platformName, productFilter, maxYearlyFeeFilter, xmlMimeType)
}

func (c *OfferServiceClient) getOffers(ctx context.Context, platformName, productFilter string, maxYearlyFeeFilter float32, mimeType string) (*OfferResult, error) {
	l := logger.GetSugar().Named(platformName)

	url := fmt.Sprintf(offersEndpoint, c.baseURL, platformName)
	headers := map[string]string{"Accept": mimeType}

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

	offer, err := parseOfferResponse(bodyText, mimeType)
	if err != nil {
		return nil, err
	}
	return &OfferResult{Offer: offer, RequestDuration: duration}, nil
}

func parseOfferResponse(body []byte, mimeType string) (*Offer, error) {
	var offer Offer
	switch mimeType {
	case jsonMimeType:
		if err := json.Unmarshal(body, &offer); err != nil {
			return nil, err
		}
		return &offer, nil
	case xmlMimeType:
		if err := xml.Unmarshal(body, &offer); err != nil {
			return nil, err
		}
		return &offer, nil
	default:
		return nil, fmt.Errorf("unsupported mime type %q", mimeType)
	}
}
