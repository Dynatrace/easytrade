package featureflag

import (
	"context"
	"fmt"

	"dynatrace.com/easytrade/background-service/config"
	"dynatrace.com/easytrade/background-service/httpclient"
)

const endpointFlagByID = "%s/v1/flags/%s"

type Flag struct {
	ID           string `json:"id"`
	Enabled      bool   `json:"enabled"`
	Name         string `json:"name"`
	Description  string `json:"description"`
	IsModifiable bool   `json:"isModifiable"`
	Tag          string `json:"tag"`
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
	url := fmt.Sprintf(endpointFlagByID, c.base, id)
	return httpclient.GetJSON[Flag](ctx, c.http, url, nil, 200)
}

func (c *Client) GetBool(ctx context.Context, id string, defaultVal bool) bool {
	flag, err := c.GetFlag(ctx, id)
	if err != nil {
		return defaultVal
	}
	return flag.Enabled
}
