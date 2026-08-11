package main

import (
	"context"
	"github.com/gin-gonic/gin"
	"net/http"
	"time"

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

func New(handlers thirdparty.Handlers) *http.Server {
	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(requestLogger())

	router.GET("/version", version.GetVersion)
	router.POST("/v1/manufacturer", handlers.PostManufacturer)

	return &http.Server{Addr: ":8080", Handler: router}
}

func Run(ctx context.Context, srv *http.Server) {
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		logger.GetSugar().Errorw("HTTP server stopped", "err", err)
	}
}
