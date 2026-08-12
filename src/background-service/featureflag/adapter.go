package featureflag

import (
	"context"

	"github.com/open-feature/go-sdk/openfeature"
)

type Adapter struct {
	client *openfeature.Client
}

type FlagService interface {
	GetBool(ctx context.Context, id string, defaultVal bool) (bool, error)
}

func NewAdapter(client *openfeature.Client) *Adapter {
	return &Adapter{client: client}
}

func (a *Adapter) GetBool(ctx context.Context, id string, defaultVal bool) (bool, error) {
	value, err := a.client.BooleanValueDetails(ctx, id, defaultVal, openfeature.NewEvaluationContext("", nil))
	if err != nil {
		return value.Value, err
	}
	return value.Value, nil
}
