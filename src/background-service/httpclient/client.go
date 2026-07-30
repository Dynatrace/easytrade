package httpclient

import (
	"bytes"
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

func Do(ctx context.Context, c *Client, method, url string, headers map[string]string, body any, wantStatus int) ([]byte, error) {
	bodyReader, err := EncodeJSON(body)
	if err != nil {
		return nil, err
	}
	req, err := c.BuildRequest(ctx, method, url, headers, bodyReader)
	if err != nil {
		return nil, err
	}

	respBody, resp, err := c.Send(req)
	if err != nil {
		return nil, err
	}
	if err := CheckStatus(resp, wantStatus); err != nil {
		return nil, err
	}

	return respBody, nil
}

func DoJSON[T any](ctx context.Context, c *Client, method, url string, headers map[string]string, body any, wantStatus int) (*T, error) {
	respBody, err := Do(ctx, c, method, url, headers, body, wantStatus)
	if err != nil {
		return nil, err
	}
	return Parse[T](respBody)
}

func GetJSON[T any](ctx context.Context, c *Client, url string, headers map[string]string, wantStatus int) (*T, error) {
	return DoJSON[T](ctx, c, http.MethodGet, url, headers, nil, wantStatus)
}

func (c *Client) BuildRequest(ctx context.Context, method, url string, headers map[string]string, body io.Reader) (*http.Request, error) {
	req, err := http.NewRequestWithContext(ctx, method, url, body)
	if err != nil {
		return nil, fmt.Errorf("failed to build request: %w", err)
	}
	for k, v := range headers {
		req.Header.Set(k, v)
	}
	return req, nil
}

func (c *Client) Send(req *http.Request) ([]byte, *http.Response, error) {
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

func CheckStatus(resp *http.Response, wantStatus int) error {
	if resp.StatusCode != wantStatus {
		return fmt.Errorf("unexpected status code %d, expected %d", resp.StatusCode, wantStatus)
	}
	return nil
}

func Parse[T any](data []byte) (*T, error) {
	var result T
	if len(data) == 0 {
		return &result, nil
	}
	if err := json.Unmarshal(data, &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal JSON: %w", err)
	}
	return &result, nil
}

func EncodeJSON(data any) (io.Reader, error) {
	if data == nil {
		return nil, nil
	}
	encoded, err := json.Marshal(data)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal JSON: %w", err)
	}
	return bytes.NewReader(encoded), nil
}
