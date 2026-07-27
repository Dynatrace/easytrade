package featureflag

import (
	"context"
	"fmt"

	"dynatrace.com/easytrade/background-service/config"
	"dynatrace.com/easytrade/background-service/httpclient"
)

type Flag struct {
	ID           string `json:"id"`
	Enabled      bool   `json:"enabled"`
	Name         string `json:"name"`
	Description  string `json:"description"`
	IsModifiable bool   `json:"isModifiable"`
	Tag          string `json:"tag"`
}

type flagsResult struct {
	Results []Flag `json:"results"`
}

type Client struct {
	base string
	http *httpclient.Client
}

func NewFromEnv(values config.Values) *Client {
	base := values.Get("FEATURE_FLAG_SERVICE_ADDRESS")
	return &Client{base: base, http: httpclient.New()}
}

func (c *Client) GetFlag(ctx context.Context, id string) (*Flag, error) {
	url := fmt.Sprintf("%s/v1/flags/%s", c.base, id)
	return httpclient.GetJSON[Flag](ctx, c.http, url, nil, 200)
}

func (c *Client) GetFlags(ctx context.Context) ([]Flag, error) {
	url := fmt.Sprintf("%s/v1/flags", c.base)
	result, err := httpclient.GetJSON[flagsResult](ctx, c.http, url, nil, 200)
	if err != nil {
		return nil, err
	}
	return result.Results, nil
}

func (c *Client) GetBool(ctx context.Context, id string, defaultVal bool) bool {
	flag, err := c.GetFlag(ctx, id)
	if err != nil {
		return defaultVal
	}
	return flag.Enabled
}
