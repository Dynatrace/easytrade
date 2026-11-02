package main

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"google.golang.org/grpc"

	"dynatrace.com/easytrade/background-service/logger"
	"dynatrace.com/easytrade/background-service/thirdparty"
	"dynatrace.com/easytrade/background-service/version"
)

func requestLogger() gin.HandlerFunc {
	l := logger.GetSugar()
	return func(ctx *gin.Context) {
		start := time.Now()
		ctx.Next()
		l.Infow("Request finished",
			"method", ctx.Request.Method,
			"path", ctx.Request.URL.Path,
			"status", ctx.Writer.Status(),
			"latency", time.Since(start),
		)
	}
}

func New(handlers thirdparty.Handlers, dbAdapterConn *grpc.ClientConn) *http.Server {
	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(requestLogger())

	router.GET("/version", version.GetVersion)
	router.POST("/v1/manufacturer", handlers.PostManufacturer)
	setupHealth(router, dbAdapterConn)

	return &http.Server{Addr: ":8080", Handler: router}
}

func Run(ctx context.Context, srv *http.Server) {
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.GetSugar().Errorw("HTTP server stopped", "err", err)
		}
	}()

	<-ctx.Done()

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		logger.GetSugar().Errorw("HTTP server graceful shutdown failed", "err", err)
	}
}
