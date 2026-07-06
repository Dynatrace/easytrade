package version

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func newTestRouter() *gin.Engine {
	r := gin.New()
	r.GET("/version", GetVersion)
	return r
}

func TestGetVersion_acceptJSON_returnsJSON(t *testing.T) {
	r := newTestRouter()
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/version", nil)
	req.Header.Set("Accept", "application/json")
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	var resp versionResponse
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("expected JSON response, got: %s", w.Body.String())
	}
	if resp.BuildVersion != BuildVersion {
		t.Errorf("expected %s, got %s", BuildVersion, resp.BuildVersion)
	}
}

func TestGetVersion_acceptText_returnsPlainText(t *testing.T) {
	r := newTestRouter()
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/version", nil)
	req.Header.Set("Accept", "text/plain")
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	body := w.Body.String()
	if !strings.Contains(body, "EasyTrade Feature Flag Service Version:") {
		t.Errorf("expected plain text version response, got: %s", body)
	}
}

func TestGetVersion_noAccept_returnsPlainText(t *testing.T) {
	r := newTestRouter()
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/version", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	body := w.Body.String()
	if !strings.Contains(body, "EasyTrade Feature Flag Service Version:") {
		t.Errorf("expected plain text version response, got: %s", body)
	}
}
