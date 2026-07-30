package thirdparty

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"time"

	"dynatrace.com/easytrade/background-service/httpclient"
	"dynatrace.com/easytrade/background-service/logger"
)

const (
	shippingAddressEndpoint = "%s/v1/orders/%s/shipping-address"
	statusEndpoint          = "%s/v1/orders/%s/status"
)

type creditCardOrderClient struct {
	baseURL string
	http    *httpclient.Client
}

func newCreditCardOrderClient(baseURL string) *creditCardOrderClient {
	return &creditCardOrderClient{baseURL: baseURL, http: httpclient.New()}
}

func (c *creditCardOrderClient) GetShippingAddress(ctx context.Context, orderID string) (*ShippingAddress, error) {
	l := logger.GetSugar()
	l.Infow("Getting shipping address for order", "orderId", orderID)

	reqURL := fmt.Sprintf(shippingAddressEndpoint, c.baseURL, url.PathEscape(orderID))
	wrapper, err := httpclient.GetJSON[StandardResponse](ctx, c.http, reqURL, nil, http.StatusOK)
	if err != nil {
		return nil, err
	}

	if wrapper.StatusCode == nil || *wrapper.StatusCode != 200 {
		l.Infow("Non-200 wrapped status received", "statusCode", wrapper.StatusCode, "message", wrapper.Message)
		return nil, nil
	}

	addr, err := httpclient.Parse[ShippingAddress](wrapper.Results)
	if err != nil {
		return nil, err
	}

	l.Infow("Got address info", "address", addr)
	return addr, nil
}

func (c *creditCardOrderClient) UpdateStatus(ctx context.Context, status OrderStatus, orderID string, details any) error {
	l := logger.GetSugar()

	reqBody := StatusRequest{OrderID: orderID, Type: string(status), Timestamp: time.Now(), Details: details}

	reqURL := fmt.Sprintf(statusEndpoint, c.baseURL, url.PathEscape(orderID))
	headers := map[string]string{"Content-Type": "application/json"}

	wrapper, err := httpclient.DoJSON[StandardResponse](ctx, c.http, http.MethodPost, reqURL, headers, reqBody, http.StatusOK)
	if err != nil {
		return err
	}

	if wrapper.StatusCode == nil || *wrapper.StatusCode != 200 {
		l.Infow("Non-200 wrapped status received", "statusCode", wrapper.StatusCode, "message", wrapper.Message)
		return fmt.Errorf("update status failed for order %s: %s", orderID, wrapper.Message)
	}

	l.Infow("updateStatus finished successfully", "message", wrapper.Message)
	return nil
}
