package aggregator

import (
	"context"
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

type OfferServiceClient struct {
	baseURL string
	http    *httpclient.Client
}

func (c *OfferServiceClient) GetOffers(ctx context.Context, platformName, productFilter string, maxYearlyFeeFilter *float32, format offerFormat) (time.Duration, error) {
	l := logger.GetSugar().Named(platformName)

	url := fmt.Sprintf(offersEndpoint, c.baseURL, platformName)
	headers := map[string]string{"Accept": format.mimeType()}

	req, err := c.http.BuildRequest(ctx, http.MethodGet, url, headers, nil)
	if err != nil {
		l.Error(err)
		return 0, err
	}
	q := req.URL.Query()
	q.Add("productFilter", productFilter)
	if maxYearlyFeeFilter != nil {
		q.Add("maxYearlyFeeFilter", fmt.Sprint(*maxYearlyFeeFilter))
	}
	req.URL.RawQuery = q.Encode()

	l.Infow("Sending offer request", "productFilter", productFilter, "maxYearlyFeeFilter", maxYearlyFeeFilter)

	start := time.Now()
	_, resp, err := c.http.Send(req)
	duration := time.Since(start)
	if err != nil {
		l.Error(err)
		return 0, err
	}

	if err := httpclient.CheckStatus(resp, http.StatusOK); err != nil {
		l.Error(err)
		return 0, err
	}

	l.Infow("Received offer response", "duration", duration)

	return duration, nil
}
