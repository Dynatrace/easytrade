package main

import (
	_ "dynatrace.com/easytrade/feature-flag-service/docs"
	"dynatrace.com/easytrade/feature-flag-service/flag"
	"dynatrace.com/easytrade/feature-flag-service/version"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func CreateRouter(svc *flag.Service) *gin.Engine {
	r := gin.New()
	r.Use(cors.Default())
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	h := flag.NewHandler(svc)
	v1Flags := r.Group("/v1/flags")
	v1Flags.GET("", h.GetAll)
	v1Flags.GET("/:flagId", h.GetByID)
	v1Flags.PUT("/:flagId", h.Update)

	r.GET("/version", version.GetVersion)
	r.GET("/swagger-ui/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	return r
}
