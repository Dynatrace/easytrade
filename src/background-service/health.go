package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func setupHealth(r *gin.Engine) {
	r.GET("/livez", handleLive)
	r.GET("/readyz", handleLive)
}

func handleLive(c *gin.Context) {
	c.String(http.StatusOK, "OK")
}
