package version

import "github.com/gin-gonic/gin"

var (
	BuildVersion = "{{BUILD_VERSION}}"
	BuildDate    = "{{BUILD_DATE}}"
	BuildCommit  = "{{BUILD_COMMIT}}"
)

type versionResponse struct {
	BuildVersion string `json:"buildVersion"`
	BuildDate    string `json:"buildDate"`
	BuildCommit  string `json:"buildCommit"`
}

func GetVersion(ctx *gin.Context) {
	accept := ctx.GetHeader("Accept")
	switch accept {
	case "application/json":
		ctx.JSON(200, versionResponse{BuildVersion, BuildDate, BuildCommit})
	default:
		ctx.String(200, "EasyTrade Feature Flag Service Version: %s\n\nBuild date: %s, git commit: %s",
			BuildVersion, BuildDate, BuildCommit)
	}
}
