package login

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
)

// TestLogin_MissingFields_ReturnsBadRequest checks that a body missing required fields is rejected
// before any database lookup is attempted.
func TestLogin_MissingFields_ReturnsBadRequest(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.POST("/api/auth/login", Login)

	req := httptest.NewRequest(http.MethodPost, "/api/auth/login", strings.NewReader("{}"))
	req.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, recorder.Code)
	}
}

// TestSignup_MissingFields_ReturnsBadRequest checks that a body missing required fields is rejected
// before any database lookup is attempted.
func TestSignup_MissingFields_ReturnsBadRequest(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.POST("/api/auth/signup", Signup)

	req := httptest.NewRequest(http.MethodPost, "/api/auth/signup", strings.NewReader("{}"))
	req.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, recorder.Code)
	}
}
