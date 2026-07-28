package server

import (
	"context"
	"net/http"
	"time"

	"dynatrace.com/easytrade/background-service/logger"
	"dynatrace.com/easytrade/background-service/thirdparty"
	"github.com/gin-gonic/gin"
)

const addr = ":8080"

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

	router.GET("/version", getVersion)
	router.POST("/v1/manufacturer", handlers.PostManufacturer)

	return &http.Server{Addr: addr, Handler: router}
}

func Run(ctx context.Context, srv *http.Server) {
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		logger.GetSugar().Errorw("HTTP server stopped", "err", err)
	}
}
