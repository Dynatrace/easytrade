package main

import (
	"time"

	"dynatrace.com/easytrade/user-service/account"
	"dynatrace.com/easytrade/user-service/login"
	"dynatrace.com/easytrade/user-service/utils"
	"dynatrace.com/easytrade/user-service/version"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func Logger() gin.HandlerFunc {
	log := utils.GetSugar()
	return func(ctx *gin.Context) {
		startTime := time.Now()

		ctx.Next()

		log.Infow("request finished",
			"method", ctx.Request.Method,
			"url", ctx.Request.URL.String(),
			"status", ctx.Writer.Status(),
			"latency", time.Since(startTime),
			"ip", ctx.ClientIP(),
		)
	}
}

// CreateRouter builds the gin engine and registers the routes ported from loginservice
func CreateRouter() *gin.Engine {
	router := gin.New()

	router.Use(cors.Default())
	router.Use(gin.Recovery())
	router.Use(Logger())

	api := router.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/login", login.Login)
			auth.POST("/signup", login.Signup)
		}

		accounts := api.Group("/accounts")
		{
			accounts.GET("/presets", account.GetPresets)
			accounts.GET("/:id", account.GetAccount)
		}

		api.GET("/version", version.GetVersion)
	}

	return router
}
