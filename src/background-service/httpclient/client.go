package httpclient

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type Client struct {
	HTTP *http.Client
}

func New() *Client {
	return &Client{HTTP: http.DefaultClient}
}

func (c *Client) Do(req *http.Request) ([]byte, *http.Response, error) {
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, resp, fmt.Errorf("failed to read response body: %w", err)
	}

	return body, resp, nil
}

func GetJSON[T any](ctx context.Context, c *Client, url string, headers map[string]string, wantStatus int) (*T, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to build request: %w", err)
	}
	for k, v := range headers {
		req.Header.Set(k, v)
	}

	return decodeResponse[T](c, req, wantStatus)
}

func decodeResponse[T any](c *Client, req *http.Request, wantStatus int) (*T, error) {
	body, resp, err := c.Do(req)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode != wantStatus {
		return nil, fmt.Errorf("unexpected status code %d, expected %d", resp.StatusCode, wantStatus)
	}

	var result T
	if len(body) == 0 {
		return &result, nil
	}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response body: %w", err)
	}
	return &result, nil
}
