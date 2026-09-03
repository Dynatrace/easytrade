package main

import "github.com/gin-gonic/gin"

func setupHealth(r *gin.Engine) {
	r.GET("/livez", handleHealth)
	r.GET("/readyz", handleHealth)
}

func handleHealth(c *gin.Context) {
	c.String(200, "OK")
}
