package httpclient

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

type payload struct {
	Name string `json:"name"`
}

func TestBuildRequest_GivenHeaders_AppliesAllOfThemToRequest(t *testing.T) {
	c := New()
	headers := map[string]string{"Accept": "application/json", "X-Custom": "value"}

	req, err := c.BuildRequest(context.Background(), http.MethodGet, "http://example.com", headers, nil)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if got := req.Header.Get("X-Custom"); got != "value" {
		t.Fatalf("expected header X-Custom to be %q, got %q", "value", got)
	}
}

func TestSend_ServerReturnsBody_ReturnsBodyAndResponse(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"name":"trade"}`))
	}))
	defer server.Close()

	c := New()
	req, err := c.BuildRequest(context.Background(), http.MethodGet, server.URL, nil, nil)
	if err != nil {
		t.Fatalf("unexpected error building request: %v", err)
	}

	body, resp, err := c.Send(req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, resp.StatusCode)
	}
	if string(body) != `{"name":"trade"}` {
		t.Fatalf("expected body %q, got %q", `{"name":"trade"}`, string(body))
	}
}

func TestSend_ServerUnreachable_ReturnsError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
	unreachableURL := server.URL
	server.Close()

	c := New()
	req, err := c.BuildRequest(context.Background(), http.MethodGet, unreachableURL, nil, nil)
	if err != nil {
		t.Fatalf("unexpected error building request: %v", err)
	}

	if _, _, err := c.Send(req); err == nil {
		t.Fatal("expected an error for an unreachable server, got nil")
	}
}

func TestCheckStatus_ActualMatchesWanted_ReturnsNil(t *testing.T) {
	resp := &http.Response{StatusCode: http.StatusOK}

	if err := CheckStatus(resp, http.StatusOK); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}

func TestCheckStatus_ActualDiffersFromWanted_ReturnsError(t *testing.T) {
	resp := &http.Response{StatusCode: http.StatusInternalServerError}

	if err := CheckStatus(resp, http.StatusOK); err == nil {
		t.Fatal("expected an error for mismatched status codes, got nil")
	}
}

func TestParse_ValidJSON_ReturnsDecodedStruct(t *testing.T) {
	result, err := Parse[payload]([]byte(`{"name":"trade"}`))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.Name != "trade" {
		t.Fatalf("expected name %q, got %q", "trade", result.Name)
	}
}

func TestParse_EmptyBody_ReturnsZeroValue(t *testing.T) {
	result, err := Parse[payload](nil)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.Name != "" {
		t.Fatalf("expected zero value, got %+v", result)
	}
}

func TestParse_InvalidJSON_ReturnsError(t *testing.T) {
	if _, err := Parse[payload]([]byte(`not json`)); err == nil {
		t.Fatal("expected an error for invalid JSON, got nil")
	}
}

func TestEncodeJSON_NilData_ReturnsNilReader(t *testing.T) {
	reader, err := EncodeJSON(nil)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if reader != nil {
		t.Fatalf("expected a nil reader, got %v", reader)
	}
}

func TestEncodeJSON_StructData_ReturnsMarshaledJSON(t *testing.T) {
	reader, err := EncodeJSON(payload{Name: "trade"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	buf := make([]byte, 64)
	n, _ := reader.Read(buf)
	if got := string(buf[:n]); got != `{"name":"trade"}` {
		t.Fatalf("expected encoded body %q, got %q", `{"name":"trade"}`, got)
	}
}

func TestDo_ServerReturnsWantedStatus_ReturnsBody(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusCreated)
		w.Write([]byte(`{"name":"trade"}`))
	}))
	defer server.Close()

	body, err := Do(context.Background(), New(), http.MethodPost, server.URL, nil, payload{Name: "trade"}, http.StatusCreated)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if string(body) != `{"name":"trade"}` {
		t.Fatalf("expected body %q, got %q", `{"name":"trade"}`, string(body))
	}
}

func TestDo_ServerReturnsUnexpectedStatus_ReturnsError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
	}))
	defer server.Close()

	if _, err := Do(context.Background(), New(), http.MethodGet, server.URL, nil, nil, http.StatusOK); err == nil {
		t.Fatal("expected an error for unexpected status code, got nil")
	}
}

func TestDoJSON_ServerReturnsWantedStatus_ReturnsDecodedStruct(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"name":"trade"}`))
	}))
	defer server.Close()

	result, err := DoJSON[payload](context.Background(), New(), http.MethodPost, server.URL, nil, payload{Name: "request"}, http.StatusOK)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.Name != "trade" {
		t.Fatalf("expected name %q, got %q", "trade", result.Name)
	}
}

func TestGetJSON_SendsGetRequest_UsesGetMethod(t *testing.T) {
	var gotMethod string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotMethod = r.Method
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"name":"trade"}`))
	}))
	defer server.Close()

	if _, err := GetJSON[payload](context.Background(), New(), server.URL, nil, http.StatusOK); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if gotMethod != http.MethodGet {
		t.Fatalf("expected method %q, got %q", http.MethodGet, gotMethod)
	}
}
