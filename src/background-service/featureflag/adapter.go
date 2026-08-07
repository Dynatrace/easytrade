package featureflag

import (
	"context"

	"github.com/open-feature/go-sdk/openfeature"
)

type Adapter struct {
	client *openfeature.Client
}

func NewAdapter(client *openfeature.Client) *Adapter {
	return &Adapter{client: client}
}

func (a *Adapter) GetBool(ctx context.Context, id string, defaultVal bool) bool {
	return a.client.Boolean(ctx, id, defaultVal, openfeature.NewEvaluationContext("", nil))
}

func (a *Adapter) GetFlag(ctx context.Context, id string) (*Flag, error) {
	detail, err := a.client.BooleanValueDetails(ctx, id, false, openfeature.NewEvaluationContext("", nil))
	if err != nil {
		return nil, err
	}
	return &Flag{ID: id, Enabled: detail.Value}, nil
}
