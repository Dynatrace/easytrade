package dbadapter

import (
	"context"
	"errors"
	"testing"
	"time"
)

func newCreateRequest(username, origin string, creationDate time.Time) CreateAccountRequest {
	return CreateAccountRequest{
		PackageId:             1,
		FirstName:             "Jane",
		LastName:              "Doe",
		Username:              username,
		Email:                 username + "@example.com",
		Password:              "hashed",
		Origin:                origin,
		Address:               "123 Main St",
		CreationDate:          creationDate,
		PackageActivationDate: creationDate,
		AccountActive:         true,
	}
}

func TestMockAdapter_CreateThenGetById_ReturnsAccount(t *testing.T) {
	m := NewMockAdapter()

	created, err := m.CreateAccount(context.Background(), newCreateRequest("jane_doe", "WEB", time.Now()))
	if err != nil {
		t.Fatalf("CreateAccount returned error: %v", err)
	}

	got, err := m.GetAccountById(context.Background(), created.Id)
	if err != nil {
		t.Fatalf("GetAccountById returned error: %v", err)
	}
	if got.Username != "jane_doe" {
		t.Fatalf("expected username %q, got %q", "jane_doe", got.Username)
	}
}

func TestMockAdapter_GetAccountByUsername_ReturnsAccount(t *testing.T) {
	m := NewMockAdapter()
	created, _ := m.CreateAccount(context.Background(), newCreateRequest("john_doe", "WEB", time.Now()))

	got, err := m.GetAccountByUsername(context.Background(), "john_doe")
	if err != nil {
		t.Fatalf("GetAccountByUsername returned error: %v", err)
	}
	if got.Id != created.Id {
		t.Fatalf("expected id %d, got %d", created.Id, got.Id)
	}
}

func TestMockAdapter_GetAccountById_Missing_ReturnsErrNotFound(t *testing.T) {
	m := NewMockAdapter()

	_, err := m.GetAccountById(context.Background(), 999)
	if !errors.Is(err, ErrNotFound) {
		t.Fatalf("expected ErrNotFound, got %v", err)
	}
}
