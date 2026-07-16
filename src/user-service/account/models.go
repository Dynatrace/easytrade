package account

import "time"

// Account is the wire format returned by the manager service's Accounts API.
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

// IsPreset reports whether the account originated from a preset (demo) package.
func (a Account) IsPreset() bool {
	return a.Origin == "PRESET"
}

func filterPresets(accounts []Account) []ShortAccount {
	var presets []ShortAccount
	for _, account := range accounts {
		if account.IsPreset() {
			presets = append(presets, account.ToShortAccount())
		}
	}
	return presets
}

// ToShortAccount projects an Account down to its public-facing summary fields.
func (a Account) ToShortAccount() ShortAccount {
	return ShortAccount{
		Id:        a.Id,
		Username:  a.Username,
		FirstName: a.FirstName,
		LastName:  a.LastName,
	}
}

// ShortAccount is the summary shape used by the /api/accounts/presets endpoint.
type ShortAccount struct {
	Id        int    `json:"id"`
	Username  string `json:"username"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
}

// AccountsContainer wraps a list of ShortAccount.
type AccountsContainer struct {
	Results []ShortAccount `json:"results"`
}
