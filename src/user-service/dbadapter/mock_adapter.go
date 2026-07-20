package dbadapter

import (
	"context"
	"sync"
)

type MockAdapter struct {
	mu       sync.Mutex
	accounts map[int]Account
	nextID   int
}

func NewMockAdapter() *MockAdapter {
	return &MockAdapter{
		accounts: make(map[int]Account),
		nextID:   1,
	}
}

func (m *MockAdapter) CreateAccount(_ context.Context, req CreateAccountRequest) (*Account, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	acc := Account{
		Id:                    m.nextID,
		PackageId:             req.PackageId,
		FirstName:             req.FirstName,
		LastName:              req.LastName,
		Username:              req.Username,
		Email:                 req.Email,
		HashedPassword:        req.Password, // caller already hashed it
		Origin:                req.Origin,
		CreationDate:          req.CreationDate,
		PackageActivationDate: req.PackageActivationDate,
		AccountActive:         req.AccountActive,
		Address:               req.Address,
	}
	m.accounts[acc.Id] = acc
	m.nextID++

	created := acc
	return &created, nil
}

func (m *MockAdapter) GetAccountById(_ context.Context, id int) (*Account, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	acc, ok := m.accounts[id]
	if !ok {
		return nil, ErrNotFound
	}
	found := acc
	return &found, nil
}

func (m *MockAdapter) GetAccountByUsername(_ context.Context, username string) (*Account, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	for _, acc := range m.accounts {
		if acc.Username == username {
			found := acc
			return &found, nil
		}
	}
	return nil, ErrNotFound
}

func (m *MockAdapter) GetAccounts(_ context.Context) ([]Account, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	accounts := make([]Account, 0, len(m.accounts))
	for _, acc := range m.accounts {
		accounts = append(accounts, acc)
	}
	return accounts, nil
}
