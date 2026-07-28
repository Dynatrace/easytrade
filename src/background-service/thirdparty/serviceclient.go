package thirdparty

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"

	"dynatrace.com/easytrade/background-service/httpclient"
	"dynatrace.com/easytrade/background-service/logger"
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

	reqURL := fmt.Sprintf("%s/v1/orders/%s/shipping-address", c.baseURL, url.PathEscape(orderID))
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, reqURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to build request: %w", err)
	}

	body, _, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}

	var wrapper StandardResponse
	if err := json.Unmarshal(body, &wrapper); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if wrapper.StatusCode == nil || *wrapper.StatusCode != 200 {
		l.Infow("Non-200 wrapped status received", "statusCode", wrapper.StatusCode, "message", wrapper.Message)
		return nil, nil
	}

	var addr ShippingAddress
	if err := json.Unmarshal(wrapper.Results, &addr); err != nil {
		return nil, fmt.Errorf("failed to unmarshal shipping address: %w", err)
	}

	l.Infow("Got address info", "address", addr)
	return &addr, nil
}

func (c *creditCardOrderClient) UpdateStatus(ctx context.Context, status OrderStatus, orderID string, details any) error {
	l := logger.GetSugar()

	reqBody := StatusRequest{OrderID: orderID, Type: string(status), Timestamp: time.Now(), Details: details}
	encoded, err := json.Marshal(reqBody)
	if err != nil {
		return fmt.Errorf("failed to marshal status update: %w", err)
	}

	l.Infow("Running updateStatus", "body", string(encoded))

	reqURL := fmt.Sprintf("%s/v1/orders/%s/status", c.baseURL, url.PathEscape(orderID))
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, reqURL, bytes.NewReader(encoded))
	if err != nil {
		return fmt.Errorf("failed to build request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	respBody, _, err := c.http.Do(req)
	if err != nil {
		return err
	}

	var wrapper StandardResponse
	if err := json.Unmarshal(respBody, &wrapper); err != nil {
		return fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if wrapper.StatusCode != nil && *wrapper.StatusCode == 200 {
		l.Infow("updateStatus finished successfully", "message", wrapper.Message)
		return nil
	}

	l.Infow("Non-200 wrapped status received", "statusCode", wrapper.StatusCode, "message", wrapper.Message)
	return fmt.Errorf("update status failed for order %s: %s", orderID, wrapper.Message)
}
