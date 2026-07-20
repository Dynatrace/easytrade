package dbadapter

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"dynatrace.com/easytrade/user-service/utils"
)

// restAdapter is the real DbAdapter implementation: an HTTP/REST client for the db-adapter
// service, configured from DB_ADAPTER_ADDRESS.
type restAdapter struct {
	baseURL    string
	httpClient *http.Client
}

func NewRestAdapter(baseURL string) DbAdapter {
	return &restAdapter{
		baseURL:    strings.TrimRight(baseURL, "/"),
		httpClient: http.DefaultClient,
	}
}

func (r *restAdapter) CreateAccount(ctx context.Context, req CreateAccountRequest) (*Account, error) {
	var acc Account
	// Provisional route: POST /api/accounts
	if err := r.do(ctx, http.MethodPost, "/api/accounts", req, &acc); err != nil {
		return nil, err
	}
	return &acc, nil
}

func (r *restAdapter) GetAccountById(ctx context.Context, id int) (*Account, error) {
	var acc Account
	// Provisional route: GET /api/accounts/{id}
	if err := r.do(ctx, http.MethodGet, fmt.Sprintf("/api/accounts/%d", id), nil, &acc); err != nil {
		return nil, err
	}
	return &acc, nil
}

func (r *restAdapter) GetAccountByUsername(ctx context.Context, username string) (*Account, error) {
	var acc Account
	// Provisional route: GET /api/accounts/by-username/{username}
	path := "/api/accounts/by-username/" + url.PathEscape(username)
	if err := r.do(ctx, http.MethodGet, path, nil, &acc); err != nil {
		return nil, err
	}
	return &acc, nil
}

func (r *restAdapter) GetAccounts(ctx context.Context) ([]Account, error) {
	var accounts []Account
	// Provisional route: GET /api/accounts
	if err := r.do(ctx, http.MethodGet, "/api/accounts", nil, &accounts); err != nil {
		return nil, err
	}
	return accounts, nil
}

// do performs a JSON request against the db-adapter and unmarshals the response into out (if
// non-nil). A 404 maps to ErrNotFound; other non-2xx statuses become errors.
func (r *restAdapter) do(ctx context.Context, method, path string, body, out any) error {
	logger := utils.GetSugar().Named("DbAdapter")

	var reader io.Reader
	if body != nil {
		payload, err := json.Marshal(body)
		if err != nil {
			logger.Error(err)
			return err
		}
		reader = bytes.NewReader(payload)
	}

	req, err := http.NewRequestWithContext(ctx, method, r.baseURL+path, reader)
	if err != nil {
		logger.Error(err)
		return err
	}
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	resp, err := r.httpClient.Do(req)
	if err != nil {
		logger.Error(err)
		return err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		logger.Error(err)
		return err
	}

	if resp.StatusCode == http.StatusNotFound {
		return ErrNotFound
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		err := fmt.Errorf("db-adapter returned status %d", resp.StatusCode)
		logger.Error(err, "response body", string(respBody))
		return err
	}

	if out != nil {
		if err := json.Unmarshal(respBody, out); err != nil {
			logger.Error(err)
			return err
		}
	}
	return nil
}
