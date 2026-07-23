package aggregator

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

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

type SignupRequest struct {
	PackageId      Package
	FirstName      string
	LastName       string
	Username       string
	Email          string
	Address        string
	HashedPassword string
	Origin         string
}

type SignupHandler interface {
	Signup(platformName string, request *SignupRequest) error
}

type OfferServiceSignupHandler struct {
	baseURL string
}

func (h *OfferServiceSignupHandler) Signup(platformName string, request *SignupRequest) error {
	l := logger.GetSugar().Named(platformName)

	url := fmt.Sprintf("%s/api/signup", h.baseURL)
	body, err := json.Marshal(request)
	if err != nil {
		l.Error(err)
		return err
	}

	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		l.Error(err)
		return err
	}
	req.Header.Set("Content-Type", jsonMimeType)

	l.Info("Signing up a user")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		l.Error(err)
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		err := fmt.Errorf("unexpected status code %d, expected 201", resp.StatusCode)
		l.Error(err)
		return err
	}

	l.Infow("Successfully registered a user", "email", request.Email)
	return nil
}
