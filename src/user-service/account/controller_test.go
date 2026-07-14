package account

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

// TestGetAccount_NotImplemented_ReturnsStub is a placeholder covering the current stub behavior.
// Replace with real request/response assertions once GetAccount is implemented.
func TestGetAccount_NotImplemented_ReturnsStub(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/api/account/:id", GetAccount)

	req := httptest.NewRequest(http.MethodGet, "/api/account/1", nil)
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, req)

	if recorder.Code != http.StatusNotImplemented {
		t.Fatalf("expected status %d, got %d", http.StatusNotImplemented, recorder.Code)
	}
}
