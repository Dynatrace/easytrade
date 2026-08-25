package main

import (
	"fmt"
	"time"

	"dynatrace.com/easytrade/pricing-service/price"
	"dynatrace.com/easytrade/pricing-service/utils"
	"dynatrace.com/easytrade/pricing-service/version"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func Logger() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		startTime := time.Now()

		ctx.Next()

		latency := time.Since(startTime)
		requestString := fmt.Sprintf("%s %s", ctx.Request.Method, ctx.Request.URL)

		utils.GetSugar().Infow("Request finished",
			"request", requestString,
			"status", ctx.Writer.Status(),
			"latency", latency,
			"ip", ctx.ClientIP(),
		)
	}
}

func CreateRouter(handler *price.Handler) *gin.Engine {
	router := gin.New()

	router.Use(cors.Default())
	router.Use(gin.Recovery())
	router.Use(Logger())

	v1 := router.Group("/v1")
	{
		pricesRoute := v1.Group("/prices")
		{
			pricesRoute.GET("/latest", handler.GetCurrentPrices)
			pricesRoute.GET("/last", handler.GetLastPrice)
			pricesRoute.GET("/instrument/:instrumentId", handler.GetPricingDataForInstrument)
		}
	}
	router.GET("/version", version.GetVersion)

	return router
}
