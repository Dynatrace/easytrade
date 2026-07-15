package account

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

// TestGetAccount_InvalidId_ReturnsBadRequest checks that a non-numeric id is rejected.
func TestGetAccount_InvalidId_ReturnsBadRequest(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/api/accounts/:id", GetAccount)

	req := httptest.NewRequest(http.MethodGet, "/api/accounts/not-a-number", nil)
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, recorder.Code)
	}
}
