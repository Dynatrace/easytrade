// Two implementations are provided: restAdapter (the real client, wired at runtime against
// DB_ADAPTER_ADDRESS) and MockAdapter
package dbadapter

import (
	"context"
	"errors"
	"time"
)

// ErrNotFound is returned by lookups when the requested account does not exist. Callers use
// errors.Is to distinguish "no such account" (e.g. 401/404) from transport failures (500).
var ErrNotFound = errors.New("account not found")

// Account is the domain representation of a user account, mirroring the db-adapter
// AccountMessage. JSON tags match the db-adapter REST wire format.
type Account struct {
	Id                    int       `json:"id"`
	PackageId             int       `json:"packageId"`
	FirstName             string    `json:"firstName"`
	LastName              string    `json:"lastName"`
	Username              string    `json:"username"`
	Email                 string    `json:"email"`
	HashedPassword        string    `json:"hashedPassword"`
	Origin                string    `json:"origin"`
	CreationDate          time.Time `json:"creationDate"`
	PackageActivationDate time.Time `json:"packageActivationDate"`
	AccountActive         bool      `json:"accountActive"`
	Address               string    `json:"address"`
}

// CreateAccountRequest is the payload for creating an account. Password is already hashed by
// the caller. The db-adapter owns the surrounding transaction, including seeding the balance.
type CreateAccountRequest struct {
	PackageId             int       `json:"packageId"`
	FirstName             string    `json:"firstName"`
	LastName              string    `json:"lastName"`
	Username              string    `json:"username"`
	Email                 string    `json:"email"`
	Password              string    `json:"password"` // hashed by caller
	Origin                string    `json:"origin"`
	Address               string    `json:"address"`
	CreationDate          time.Time `json:"creationDate"`
	PackageActivationDate time.Time `json:"packageActivationDate"`
	AccountActive         bool      `json:"accountActive"`
}

type DbAdapter interface {
	CreateAccount(ctx context.Context, req CreateAccountRequest) (*Account, error)
	GetAccountById(ctx context.Context, id int) (*Account, error)
	GetAccountByUsername(ctx context.Context, username string) (*Account, error)
	GetAccounts(ctx context.Context) ([]Account, error)
}
