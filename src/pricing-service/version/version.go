package version

import "fmt"

const (
	VersionTemplate = "EasyTrade Pricing Service Version: %s\n\nBuild date: %s, git commit: %s"
	BuildVersion    = "{{BUILD_VERSION}}"
	BuildDate       = "{{BUILD_DATE}}"
	BuildCommit     = "{{BUILD_COMMIT}}"
)

type version struct {
	BuildVersion string `json:"buildVersion"`
	BuildDate    string `json:"buildDate"`
	BuildCommit  string `json:"buildCommit"`
}

func (v *version) toString() string {
	return fmt.Sprintf(VersionTemplate, BuildVersion, BuildDate, BuildCommit)
}
