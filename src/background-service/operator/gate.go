package operator

import "os"

// podNamespaceEnv is reused as the "are we running inside Kubernetes?" gate.
// It is already required by this subsystem, is never set by either compose
// file (Docker Compose has no equivalent), and is exactly what Kubernetes'
// Downward API idiomatically injects into every pod — so no second,
// purpose-built env var is needed to detect the same thing.
const podNamespaceEnv = "POD_NAMESPACE"

// Enabled reports whether the operator subsystem should start at all.
// POD_NAMESPACE is checked directly here, bypassing the shared
// config.Registry.
func Enabled() bool {
	_, found := os.LookupEnv(podNamespaceEnv)
	return found
}
