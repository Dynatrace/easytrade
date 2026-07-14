package main

import (
	"fmt"
	"time"

	"dynatrace.com/easytrade/user-service/account"
	"dynatrace.com/easytrade/user-service/login"
	"dynatrace.com/easytrade/user-service/version"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
)

func Logger() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		startTime := time.Now()

		ctx.Next()

		latency := time.Since(startTime)
		requestString := fmt.Sprintf("%s %s", ctx.Request.Method, ctx.Request.URL)

		log.WithFields(log.Fields{
			"request": requestString,
			"status":  ctx.Writer.Status(),
			"latency": latency,
			"ip":      ctx.ClientIP(),
		}).Info("Request finished")
	}
}

// CreateRouter builds the gin engine and registers the routes ported from loginservice
// (excluding logout) and accountservice.
func CreateRouter() *gin.Engine {
	router := gin.New()

	router.Use(cors.Default())
	router.Use(gin.Recovery())
	router.Use(Logger())

	api := router.Group("/api")
	{
		api.POST("/Login", login.Login)
		api.POST("/Signup", login.Signup)

		accountsGroup := api.Group("/Accounts")
		{
			accountsGroup.GET("/GetAccountById/:id", login.GetAccountById)
			accountsGroup.GET("/GetAccountByUsername/:username", login.GetAccountByUsername)
			accountsGroup.POST("/CreateNewAccount", login.CreateNewAccount)
		}

		accountV1 := api.Group("/account")
		{
			accountV1.GET("/:id", account.GetAccount)
			accountV1.PUT("/update", account.UpdateAccount)
		}

		accountV2 := api.Group("/accounts")
		{
			accountV2.GET("/presets", account.GetPresets)
			accountV2.GET("/:id", account.GetAccount)
			accountV2.PUT("/", account.UpdateAccount)
		}

		api.GET("/version", version.GetVersion)
	}

	return router
}
