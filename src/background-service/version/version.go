package version

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

// Build-time version placeholders, substituted via -ldflags at Docker build
// time, matching the exact convention already used by src/pricing-service's
// version package (see its Dockerfile/version.go).
var (
	versionTemplate = "EasyTrade Background Service Version: %s\n\nBuild date: %s, git commit: %s"
	buildVersion    = "{{BUILD_VERSION}}"
	buildDate       = "{{BUILD_DATE}}"
	buildCommit     = "{{BUILD_COMMIT}}"
)

type version struct {
	BuildVersion string `json:"buildVersion"`
	BuildDate    string `json:"buildDate"`
	BuildCommit  string `json:"buildCommit"`
}

func (v version) toString() string {
	return fmt.Sprintf(versionTemplate, v.BuildVersion, v.BuildDate, v.BuildCommit)
}

func GetVersion(ctx *gin.Context) {
	v := version{BuildVersion: buildVersion, BuildDate: buildDate, BuildCommit: buildCommit}
	accept := ctx.NegotiateFormat("text/plain", "application/json")

	switch accept {
	case "application/json":
		ctx.IndentedJSON(200, v)
	default:
		ctx.String(200, v.toString())
	}
}
