package version

const VersionTemplate = "EasyTrade DB Adapter Version: %s\n\nBuild date: %s, git commit: %s"

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
