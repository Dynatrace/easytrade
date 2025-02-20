package signup

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"dynatrace.com/easytrade/aggregator-service/config"
	"dynatrace.com/easytrade/aggregator-service/logger"
)

const jsonMimeType = "application/json"

type SignupHandler interface {
	Signup(platform string, request *SignupRequest) error
}

type OfferServiceSignupHandler struct {
	config.OfferServiceConfig
}

func (sh *OfferServiceSignupHandler) Signup(platformName string, request *SignupRequest) error {
	l := logger.GetSugar().Named(platformName)

	url := fmt.Sprintf("%s://%s:%d/api/signup", sh.Protocol, sh.Host, sh.Port)
	body, err := json.Marshal(request)
	if err != nil {
		l.Error(err)
		return err
	}
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		l.Error(err)
		return err
	}
	req.Header.Add("Content-Type", jsonMimeType)

	l.Info("Signing up a user")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		l.Error(err)
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 201 {
		err := fmt.Errorf("unexpected status code %d, expected 201", resp.StatusCode)
		l.Error(err)
		return err
	}

	l.Info("Successfully registered a user", "email", request.Email)
	return nil
}
