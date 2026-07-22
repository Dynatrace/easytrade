package account

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"dynatrace.com/easytrade/user-service/dbadapter/proto"
	"github.com/gin-gonic/gin"
	"google.golang.org/protobuf/types/known/timestamppb"
)

// newTestRouter builds a gin engine wired to a Handler backed by the given fake client.
func newTestRouter(client proto.AccountServiceClient) *gin.Engine {
	gin.SetMode(gin.TestMode)
	h := NewHandler(client)
	router := gin.New()
	router.POST("/api/auth/login", h.Login)
	router.POST("/api/auth/signup", h.Signup)
	router.GET("/api/accounts/presets", h.GetPresets)
	router.GET("/api/accounts/:id", h.GetAccount)
	return router
}

// seedAccount creates an account in the fake client with a known password and returns its id.
func seedAccount(t *testing.T, client *fakeAccountServiceClient, username, password, origin string) string {
	t.Helper()
	now := timestamppb.Now()
	acc, err := client.CreateAccount(context.Background(), &proto.CreateAccountRequest{
		PackageId:             "1",
		FirstName:             "Jane",
		LastName:              "Doe",
		Username:              username,
		Email:                 username + "@example.com",
		Password:              HashPassword(password),
		Origin:                origin,
		Address:               "123 Main St",
		CreationDate:          now,
		PackageActivationDate: now,
		AccountActive:         true,
	})
	if err != nil {
		t.Fatalf("seed CreateAccount returned error: %v", err)
	}
	return acc.Id
}

func doRequest(router *gin.Engine, method, target, body string) *httptest.ResponseRecorder {
	var reader *strings.Reader
	if body != "" {
		reader = strings.NewReader(body)
	} else {
		reader = strings.NewReader("")
	}
	req := httptest.NewRequest(method, target, reader)
	req.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, req)
	return recorder
}

// TestLogin_MissingFields_ReturnsBadRequest checks a body missing required fields is rejected
// before any client lookup is attempted.
func TestLogin_MissingFields_ReturnsBadRequest(t *testing.T) {
	router := newTestRouter(newFakeAccountServiceClient())

	recorder := doRequest(router, http.MethodPost, "/api/auth/login", "{}")

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, recorder.Code)
	}
}

// TestLogin_ValidCredentials_ReturnsOk checks a correct username/password returns 200.
func TestLogin_ValidCredentials_ReturnsOk(t *testing.T) {
	client := newFakeAccountServiceClient()
	seedAccount(t, client, "demouser", "demopass", "WEB")
	router := newTestRouter(client)

	recorder := doRequest(router, http.MethodPost, "/api/auth/login",
		`{"username":"demouser","password":"demopass"}`)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, recorder.Code)
	}
}

// TestLogin_WrongPassword_ReturnsUnauthorized checks a bad password returns 401.
func TestLogin_WrongPassword_ReturnsUnauthorized(t *testing.T) {
	client := newFakeAccountServiceClient()
	seedAccount(t, client, "demouser", "demopass", "WEB")
	router := newTestRouter(client)

	recorder := doRequest(router, http.MethodPost, "/api/auth/login",
		`{"username":"demouser","password":"wrong"}`)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, recorder.Code)
	}
}

// TestLogin_UnknownUser_ReturnsUnauthorized checks an unknown username returns 401.
func TestLogin_UnknownUser_ReturnsUnauthorized(t *testing.T) {
	router := newTestRouter(newFakeAccountServiceClient())

	recorder := doRequest(router, http.MethodPost, "/api/auth/login",
		`{"username":"nobody","password":"whatever"}`)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, recorder.Code)
	}
}

// TestSignup_MissingFields_ReturnsBadRequest checks a body missing required fields is rejected.
func TestSignup_MissingFields_ReturnsBadRequest(t *testing.T) {
	router := newTestRouter(newFakeAccountServiceClient())

	recorder := doRequest(router, http.MethodPost, "/api/auth/signup", "{}")

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, recorder.Code)
	}
}

// TestSignup_ValidPayload_ReturnsCreated checks a complete signup payload returns 201.
func TestSignup_ValidPayload_ReturnsCreated(t *testing.T) {
	router := newTestRouter(newFakeAccountServiceClient())

	body := `{"packageId":1,"firstName":"Jane","lastName":"Doe","username":"jane_doe",` +
		`"email":"jane.doe@example.com","password":"securepassword","origin":"WEB",` +
		`"address":"123 Main St"}`
	recorder := doRequest(router, http.MethodPost, "/api/auth/signup", body)

	if recorder.Code != http.StatusCreated {
		t.Fatalf("expected status %d, got %d", http.StatusCreated, recorder.Code)
	}
}

// TestGetAccount_ExistingId_ReturnsOk checks an existing account is returned with 200.
func TestGetAccount_ExistingId_ReturnsOk(t *testing.T) {
	client := newFakeAccountServiceClient()
	id := seedAccount(t, client, "demouser", "demopass", "WEB")
	router := newTestRouter(client)

	recorder := doRequest(router, http.MethodGet, "/api/accounts/"+id, "")

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, recorder.Code)
	}
}

// TestGetAccount_MissingId_ReturnsNotFound checks an unknown id returns 404.
func TestGetAccount_MissingId_ReturnsNotFound(t *testing.T) {
	router := newTestRouter(newFakeAccountServiceClient())

	recorder := doRequest(router, http.MethodGet, "/api/accounts/999", "")

	if recorder.Code != http.StatusNotFound {
		t.Fatalf("expected status %d, got %d", http.StatusNotFound, recorder.Code)
	}
}
