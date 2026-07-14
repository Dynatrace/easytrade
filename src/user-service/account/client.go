package account

import (
	"net/http"
	"os"

	"dynatrace.com/easytrade/user-service/utils"
)

// ManagerClient is an HTTP client for the manager service's Accounts API, ported from
// accountservice's use of java.net.http.HttpClient against MANAGER_HOSTANDPORT.
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
//
// TODO: not implemented yet - this is a scaffold-only stub.
func (c *ManagerClient) GetAccountById(id int) (*Account, error) {
	panic("not implemented")
}

// ModifyAccount calls PUT /api/Accounts/ModifyAccount on the manager service.
//
// TODO: not implemented yet - this is a scaffold-only stub.
func (c *ManagerClient) ModifyAccount(account Account) error {
	panic("not implemented")
}

// GetAccounts calls GET /api/Accounts/ on the manager service to list all accounts.
//
// TODO: not implemented yet - this is a scaffold-only stub.
func (c *ManagerClient) GetAccounts() ([]Account, error) {
	panic("not implemented")
}
