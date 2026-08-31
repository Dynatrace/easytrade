package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"google.golang.org/grpc"
	"google.golang.org/grpc/connectivity"
)

func setupHealth(r *gin.Engine, dbAdapterConn *grpc.ClientConn) {
	r.GET("/livez", handleLive)
	r.GET("/readyz", handleReady(dbAdapterConn))
}

func handleLive(c *gin.Context) {
	c.String(http.StatusOK, "OK")
}

func handleReady(conn *grpc.ClientConn) gin.HandlerFunc {
	return func(c *gin.Context) {
		if conn == nil {
			c.String(http.StatusServiceUnavailable, "Service Unavailable")
			return
		}

		state := conn.GetState()

		if state == connectivity.Ready {
			c.String(http.StatusOK, "OK")
			return
		}

		if state == connectivity.Idle {
			conn.Connect()
		}

		c.String(http.StatusServiceUnavailable, "Service Unavailable")
	}
}
