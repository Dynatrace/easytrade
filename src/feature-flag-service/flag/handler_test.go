package flag

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func newTestRouter(svc *Service) *gin.Engine {
	r := gin.New()
	h := NewHandler(svc)
	r.GET("/v1/flags", h.GetAll)
	r.GET("/v1/flags/:flagId", h.GetByID)
	r.PUT("/v1/flags/:flagId", h.Update)
	return r
}

func TestGetByID_found_200(t *testing.T) {
	r := newTestRouter(NewService(testFlags()))
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/v1/flags/FLAG_1", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	var f Flag
	if err := json.Unmarshal(w.Body.Bytes(), &f); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	if f.ID != "FLAG_1" {
		t.Errorf("expected FLAG_1, got %s", f.ID)
	}
}

func TestGetByID_notFound_404(t *testing.T) {
	r := newTestRouter(NewService(testFlags()))
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/v1/flags/MISSING", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusNotFound {
		t.Errorf("expected 404, got %d", w.Code)
	}
}

func TestGetAll_noTag_200(t *testing.T) {
	r := newTestRouter(NewService(testFlags()))
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/v1/flags", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	var container FlagContainer
	if err := json.Unmarshal(w.Body.Bytes(), &container); err != nil {
		t.Fatalf("failed to unmarshal: %v", err)
	}
	if len(container.Results) != 3 {
		t.Errorf("expected 3 flags, got %d", len(container.Results))
	}
}

func TestGetAll_withTag_200(t *testing.T) {
	r := newTestRouter(NewService(testFlags()))
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/v1/flags?tag=config", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	var container FlagContainer
	if err := json.Unmarshal(w.Body.Bytes(), &container); err != nil {
		t.Fatalf("failed to unmarshal: %v", err)
	}
	if len(container.Results) != 2 {
		t.Errorf("expected 2 config flags, got %d", len(container.Results))
	}
}

func TestGetAll_unknownTag_200EmptyResults(t *testing.T) {
	r := newTestRouter(NewService(testFlags()))
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/v1/flags?tag=no_such_tag", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	var container FlagContainer
	if err := json.Unmarshal(w.Body.Bytes(), &container); err != nil {
		t.Fatalf("failed to unmarshal: %v", err)
	}
	if len(container.Results) != 0 {
		t.Errorf("expected 0 flags, got %d", len(container.Results))
	}
}

func TestUpdate_success_200(t *testing.T) {
	r := newTestRouter(NewService(testFlags()))
	w := httptest.NewRecorder()
	body := bytes.NewBufferString(`{"enabled": false}`)
	req, _ := http.NewRequest(http.MethodPut, "/v1/flags/FLAG_1", body)
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	var f Flag
	if err := json.Unmarshal(w.Body.Bytes(), &f); err != nil {
		t.Fatalf("failed to unmarshal: %v", err)
	}
	if f.Enabled != false {
		t.Error("expected enabled to be false")
	}
}

func TestUpdate_nonModifiable_400(t *testing.T) {
	r := newTestRouter(NewService(testFlags()))
	w := httptest.NewRecorder()
	body := bytes.NewBufferString(`{"enabled": false}`)
	req, _ := http.NewRequest(http.MethodPut, "/v1/flags/FLAG_3", body)
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)
	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", w.Code)
	}
}

func TestUpdate_notFound_404(t *testing.T) {
	r := newTestRouter(NewService(testFlags()))
	w := httptest.NewRecorder()
	body := bytes.NewBufferString(`{"enabled": false}`)
	req, _ := http.NewRequest(http.MethodPut, "/v1/flags/MISSING", body)
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)
	if w.Code != http.StatusNotFound {
		t.Errorf("expected 404, got %d", w.Code)
	}
}
