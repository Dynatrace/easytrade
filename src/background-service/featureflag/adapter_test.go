package featureflag

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/open-feature/go-sdk/openfeature"

	"dynatrace.com/easytrade/background-service/httpclient"
)

// newTestAdapter registers the Provider under a domain unique to the running
// test and returns an Adapter bound to it, exercising the same
// registration -> resolution -> adapter path main.go wires up in production.
func newTestAdapter(t *testing.T, base string) *Adapter {
	t.Helper()
	provider := &Provider{base: base, http: httpclient.New()}
	if err := openfeature.SetNamedProviderAndWait(t.Name(), provider); err != nil {
		t.Fatalf("failed to register provider: %v", err)
	}
	return NewAdapter(openfeature.NewClient(t.Name()))
}

func TestGetBool_FlagEnabled_ReturnsTrue(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"id":"factory_crisis","enabled":true}`))
	}))
	defer server.Close()

	a := newTestAdapter(t, server.URL)

	if got, _ := a.GetBool(context.Background(), "factory_crisis", false); got != true {
		t.Fatalf("expected true, got %v", got)
	}
}

func TestGetBool_FlagDisabled_ReturnsFalse(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"id":"factory_crisis","enabled":false}`))
	}))
	defer server.Close()

	a := newTestAdapter(t, server.URL)

	if got, _ := a.GetBool(context.Background(), "factory_crisis", true); got != false {
		t.Fatalf("expected false, got %v", got)
	}
}

func TestGetBool_ServiceUnreachable_FallsBackToDefault(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
	unreachableURL := server.URL
	server.Close()

	a := newTestAdapter(t, unreachableURL)

	if got, _ := a.GetBool(context.Background(), "factory_crisis", true); got != true {
		t.Fatalf("expected fallback to default true, got %v", got)
	}
}
