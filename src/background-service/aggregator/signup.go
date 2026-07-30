package aggregator

import (
	"context"
	"fmt"
	"net/http"

	"github.com/google/uuid"

	"dynatrace.com/easytrade/background-service/httpclient"
	"dynatrace.com/easytrade/background-service/logger"
)

type Package int

const (
	StarterPackage Package = iota + 1
	LightPackage
	ProPackage
)

func (p Package) String() string {
	switch p {
	case StarterPackage:
		return "Starter"
	case LightPackage:
		return "Light"
	case ProPackage:
		return "Pro"
	default:
		return "Unknown"
	}
}

// placeholders
var packageIDs = map[Package]uuid.UUID{
	StarterPackage: uuid.MustParse("11111111-1111-1111-1111-111111111111"),
	LightPackage:   uuid.MustParse("22222222-2222-2222-2222-222222222222"),
	ProPackage:     uuid.MustParse("33333333-3333-3333-3333-333333333333"),
}

type SignupRequest struct {
	PackageId uuid.UUID `json:"packageId"`
	FirstName string    `json:"firstName"`
	LastName  string    `json:"lastName"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	Address   string    `json:"address"`
	Password  string    `json:"password"`
	Origin    string    `json:"origin"`
}

type SignupHandler interface {
	Signup(ctx context.Context, platformName string, request *SignupRequest) error
}

func (h *OfferServiceClient) Signup(ctx context.Context, platformName string, request *SignupRequest) error {
	l := logger.GetSugar().Named(platformName)

	headers := map[string]string{
		"Content-Type": jsonMimeType,
	}

	url := fmt.Sprintf(signupEndpoint, h.baseURL)
	_, err := httpclient.Do(ctx, h.http, http.MethodPost, url, headers, request, http.StatusCreated)
	if err != nil {
		l.Error(err)
		return err
	}

	l.Infow("Successfully registered a user", "email", request.Email)
	return nil
}
