package account

import (
	"dynatrace.com/easytrade/user-service/utils"
	"fmt"
	"net/http"
	"os"
	"io"
	"encoding/json"
	"bytes"
)

// ManagerClient is an HTTP client for the manager service's Accounts API, reached via
// MANAGER_HOSTANDPORT.
type ManagerClient struct {
	hostAndPort string
	httpClient  *http.Client
}

func NewManagerClient() *ManagerClient {
	return &ManagerClient{
		hostAndPort: os.Getenv(utils.ManagerHostAndPort),
		httpClient:  http.DefaultClient,
	}
}

// GetAccountById calls GET /api/Accounts/GetAccountById/{id} on the manager service.
func (c *ManagerClient) GetAccountById(id int) (*Account, error) {
	logger := utils.GetSugar().Named("ManagerClient")

	url := fmt.Sprintf("http://%s/api/Accounts/GetAccountById/%d", c.hostAndPort, id)
	resp, err := c.httpClient.Get(url)
	if err != nil {
		logger.Error(err)
		return nil, err
	}
	defer resp.Body.Close()
	
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		logger.Error(err)
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		err := fmt.Errorf("unexpected status code %d, expected 200", resp.StatusCode)
		logger.Error(err, "response body", string(body))
		return nil, err
	}

	var account Account
	if err := json.Unmarshal(body, &account); err != nil {
		logger.Error(err)
		return nil, err
	}

	return &account, nil

}

// ModifyAccount calls PUT /api/Accounts/ModifyAccount on the manager service.
func (c *ManagerClient) ModifyAccount(account Account) error {
	logger := utils.GetSugar().Named("ManagerClient")
	url := fmt.Sprintf("http://%s/api/Accounts/ModifyAccount", c.hostAndPort)
	body, err := json.Marshal(account)
	if err != nil {
		logger.Error(err)
		return err
	}

	req, err := http.NewRequest("PUT", url, bytes.NewBuffer(body))
	if err != nil {
		logger.Error(err)
		return err
	}
	req.Header.Add("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		logger.Error(err)
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		err := fmt.Errorf("unexpected status code %d, expected 200", resp.StatusCode)
		logger.Error(err, "response body", string(body))
		return err
	}

	return nil
}

// GetAccounts calls GET /api/Accounts/ on the manager service to list all accounts.
func (c *ManagerClient) GetAccounts() ([]Account, error) {
	logger := utils.GetSugar().Named("ManagerClient")
	url := fmt.Sprintf("http://%s/api/Accounts", c.hostAndPort)
	resp, err := c.httpClient.Get(url)
	if err != nil {
		logger.Error(err)
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		logger.Error(err)
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		err := fmt.Errorf("unexpected status code %d, expected 200", resp.StatusCode)
		logger.Error(err, "response body", string(body))
		return nil, err
	}

	var accounts []Account
	if err := json.Unmarshal(body, &accounts); err != nil {
		logger.Error(err)
		return nil, err
	}

	return accounts, nil
}
