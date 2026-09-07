package health

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/dynatrace/easytrade/dbadapter/repository"
	log "github.com/sirupsen/logrus"
)

func Start(port string, backend repository.DBBackend) {
	server := NewServer(port, backend)
	go func() {
		log.Infof("health server listening on :%s", port)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.WithError(err).Fatal("health server failed")
		}
	}()
}

func NewServer(port string, backend repository.DBBackend) *http.Server {
	mux := http.NewServeMux()
	mux.HandleFunc("/livez", livez)
	mux.HandleFunc("/readyz", readyz(backend))
	return &http.Server{
		Addr:              fmt.Sprintf(":%s", port),
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
	}
}

func livez(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, "OK")
}

func readyz(backend repository.DBBackend) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
		defer cancel()
		if err := backend.Ping(ctx); err != nil {
			log.WithError(err).Warn("readyz: database not reachable")
			http.Error(w, "Service Unavailable", http.StatusServiceUnavailable)
			return
		}
		w.WriteHeader(http.StatusOK)
		fmt.Fprint(w, "OK")
	}
}
