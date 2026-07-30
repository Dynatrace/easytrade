package version

import (
	"github.com/gin-gonic/gin"
)

func GetVersion(ctx *gin.Context) {
	v := version{BuildVersion, BuildDate, BuildCommit}
	accept := ctx.NegotiateFormat("text/plain", "application/json")

	switch accept {
	case "application/json":
		ctx.IndentedJSON(200, v)
	default:
		ctx.String(200, v.toString())
	}
}
