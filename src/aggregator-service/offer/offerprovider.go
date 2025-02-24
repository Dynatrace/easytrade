package offer

import (
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io"
	"net/http"
	"time"

	"dynatrace.com/easytrade/aggregator-service/config"
	"dynatrace.com/easytrade/aggregator-service/logger"
)

const (
	jsonMimeType = "application/json"
	xmlMimeType  = "application/xml"
)

type OfferResult struct {
	Offer           *Offer
	RequestDuration time.Duration
}

type OfferProvider interface {
	GetOffersJson(platformName string, productFilter string, maxYearlyFeeFilter float32) (*OfferResult, error)
	GetOffersXml(platformName string, productFilter string, maxYearlyFeeFilter float32) (*OfferResult, error)
}

type OfferServiceConnector struct {
	config.OfferServiceConfig
}

func (op *OfferServiceConnector) GetOffersJson(platformName string, productFilter string, maxYearlyFeeFilter float32) (*OfferResult, error) {
	return op.getOffers(platformName, productFilter, maxYearlyFeeFilter, jsonMimeType)
}

func (op *OfferServiceConnector) GetOffersXml(platformName string, productFilter string, maxYearlyFeeFilter float32) (*OfferResult, error) {
	return op.getOffers(platformName, productFilter, maxYearlyFeeFilter, xmlMimeType)
}

func (op *OfferServiceConnector) getOffers(platformName string, productFilter string, maxYearlyFeeFilter float32, mimeType string) (*OfferResult, error) {
	l := logger.GetSugar().Named(platformName)

	url := fmt.Sprintf("%s://%s:%d/api/offers/%s", op.Protocol, op.Host, op.Port, platformName)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		l.Error(err)
		return nil, err
	}
	req.Header.Set("Accept", mimeType)
	q := req.URL.Query()
	q.Add("productFilter", productFilter)
	q.Add("maxYearlyFeeFilter", fmt.Sprint(maxYearlyFeeFilter))

	l.Infow("Sending offer request", "productFilter", productFilter, "maxYearlyFeeFilter", maxYearlyFeeFilter)

	startTime := time.Now()
	resp, err := http.DefaultClient.Do(req)
	duration := time.Since(startTime)
	if err != nil {
		l.Error(err)
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
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

	offer, err := parseResponse(bodyText, mimeType)
	return &OfferResult{Offer: offer, RequestDuration: duration}, err
}

func parseResponse(body []byte, mimeType string) (*Offer, error) {
	var (
		offer *Offer
		err   error
	)
	switch mimeType {
	case jsonMimeType:
		offer, err = offerFromJson(body)
	case xmlMimeType:
		offer, err = offerFromXml(body)
	default:
		return nil, err
	}
	if err != nil {
		return nil, err
	}
	return offer, nil
}

func offerFromJson(jsonData []byte) (*Offer, error) {
	var offer Offer
	err := json.Unmarshal(jsonData, &offer)
	if err != nil {
		return nil, err
	}
	return &offer, nil
}

func offerFromXml(xmlData []byte) (*Offer, error) {
	var offerXml OfferXml
	err := xml.Unmarshal(xmlData, &offerXml)
	if err != nil {
		return nil, err
	}
	return &offerXml.Offer, nil
}
