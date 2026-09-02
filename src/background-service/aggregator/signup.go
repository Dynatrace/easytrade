package aggregator

import (
	"context"
	"fmt"
	"math/rand"
	"net/http"

	"github.com/go-faker/faker/v4"
	"github.com/google/uuid"

	"dynatrace.com/easytrade/background-service/logger"
)

var (
	starterPackageID = uuid.MustParse("a0000000-0000-4000-8000-000000000001")
	lightPackageID   = uuid.MustParse("a0000000-0000-4000-8000-000000000002")
	proPackageID     = uuid.MustParse("a0000000-0000-4000-8000-000000000003")
)

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

func (h *OfferServiceClient) Signup(ctx context.Context, platformName string, request *SignupRequest) error {
	l := logger.GetSugar().Named(platformName)

	headers := map[string]string{
		"Content-Type": jsonOfferFormat.mimeType(),
	}

	url := fmt.Sprintf(signupEndpoint, h.baseURL)
	_, err := h.http.Do(ctx, http.MethodPost, url, headers, request, http.StatusCreated)
	if err != nil {
		l.Error(err)
		return err
	}

	l.Infow("Successfully registered a user", "email", request.Email)
	return nil
}

func newSignupRequest(packageProb PackageProbability) *SignupRequest {
	sr := &SignupRequest{}

	sr.PackageId = randomPackageID(packageProb)
	sr.FirstName = faker.FirstName()
	sr.LastName = faker.LastName()
	sr.Username = sr.FirstName + sr.LastName
	sr.Email = sr.Username + "@" + faker.DomainName()
	sr.Address = faker.GetRealAddress().Address
	sr.Password = faker.Password()
	sr.Origin = "AGGREGATOR"

	return sr
}

func randomPackageID(p PackageProbability) uuid.UUID {
	sum := p.Starter + p.Light + p.Pro
	target := rand.Float32() * sum

	switch {
	case target < p.Starter:
		return starterPackageID
	case target < p.Starter+p.Light:
		return lightPackageID
	default:
		return proPackageID
	}
}
