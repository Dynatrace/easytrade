package featureflag

import (
	"context"
	"fmt"

	"github.com/open-feature/go-sdk/openfeature"

	"dynatrace.com/easytrade/background-service/config"
	"dynatrace.com/easytrade/background-service/httpclient"
	"dynatrace.com/easytrade/background-service/logger"
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

type Provider struct {
	base string
	http *httpclient.Client
}

func NewProviderFromEnv(values config.Values) *Provider {
	base := values.Get("FEATURE_FLAG_SERVICE_ADDRESS")
	return &Provider{base: base, http: httpclient.New()}
}

func (p *Provider) Metadata() openfeature.Metadata {
	return openfeature.Metadata{Name: "EasyTrade Provider"}
}

func (p *Provider) BooleanEvaluation(ctx context.Context, flag string, defaultValue bool, _ openfeature.FlattenedContext) openfeature.BoolResolutionDetail {
	url := fmt.Sprintf(endpointFlagByID, p.base, flag)
	result, err := httpclient.GetJSON[Flag](ctx, p.http, url, nil, 200)
	if err != nil {
		logger.GetSugar().Warnw("Failed to resolve feature flag; falling back to default", "flag", flag, "err", err)
		return openfeature.BoolResolutionDetail{
			Value: defaultValue,
			ProviderResolutionDetail: openfeature.ProviderResolutionDetail{
				Reason:          openfeature.DefaultReason,
				ResolutionError: openfeature.NewGeneralResolutionError(err.Error()),
			},
		}
	}
	return openfeature.BoolResolutionDetail{
		Value: result.Enabled,
		ProviderResolutionDetail: openfeature.ProviderResolutionDetail{
			Reason: openfeature.StaticReason,
		},
	}
}

func (p *Provider) StringEvaluation(_ context.Context, _ string, defaultValue string, _ openfeature.FlattenedContext) openfeature.StringResolutionDetail {
	return openfeature.StringResolutionDetail{
		Value: defaultValue,
		ProviderResolutionDetail: openfeature.ProviderResolutionDetail{
			Reason:          openfeature.ErrorReason,
			ResolutionError: openfeature.NewGeneralResolutionError("string evaluation is not implemented"),
		},
	}
}

func (p *Provider) FloatEvaluation(_ context.Context, _ string, defaultValue float64, _ openfeature.FlattenedContext) openfeature.FloatResolutionDetail {
	return openfeature.FloatResolutionDetail{
		Value: defaultValue,
		ProviderResolutionDetail: openfeature.ProviderResolutionDetail{
			Reason:          openfeature.ErrorReason,
			ResolutionError: openfeature.NewGeneralResolutionError("float evaluation is not implemented"),
		},
	}
}

func (p *Provider) IntEvaluation(_ context.Context, _ string, defaultValue int64, _ openfeature.FlattenedContext) openfeature.IntResolutionDetail {
	return openfeature.IntResolutionDetail{
		Value: defaultValue,
		ProviderResolutionDetail: openfeature.ProviderResolutionDetail{
			Reason:          openfeature.ErrorReason,
			ResolutionError: openfeature.NewGeneralResolutionError("int evaluation is not implemented"),
		},
	}
}

func (p *Provider) ObjectEvaluation(_ context.Context, _ string, defaultValue any, _ openfeature.FlattenedContext) openfeature.InterfaceResolutionDetail {
	return openfeature.InterfaceResolutionDetail{
		Value: defaultValue,
		ProviderResolutionDetail: openfeature.ProviderResolutionDetail{
			Reason:          openfeature.ErrorReason,
			ResolutionError: openfeature.NewGeneralResolutionError("object evaluation is not implemented"),
		},
	}
}

func (p *Provider) Hooks() []openfeature.Hook {
	return nil
}
