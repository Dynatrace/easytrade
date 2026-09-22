package version

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func GetVersion(w http.ResponseWriter, r *http.Request) {
	v := versionResponse{BuildVersion, BuildDate, BuildCommit}
	if r.Header.Get("Accept") == "application/json" {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(v)
		return
	}
	fmt.Fprintf(w, VersionTemplate, v.BuildVersion, v.BuildDate, v.BuildCommit)
}
