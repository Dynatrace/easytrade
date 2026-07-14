package login

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

// TestLogin_NotImplemented_ReturnsStub is a placeholder covering the current stub behavior.
// Replace with real request/response assertions once Login is implemented.
func TestLogin_NotImplemented_ReturnsStub(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.POST("/api/Login", Login)

	req := httptest.NewRequest(http.MethodPost, "/api/Login", nil)
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, req)

	if recorder.Code != http.StatusNotImplemented {
		t.Fatalf("expected status %d, got %d", http.StatusNotImplemented, recorder.Code)
	}
}
