# EasyTrade — Agent Instructions

## Repository structure

`src/` contains 12 services grouped by technology, plus `proto/` (shared gRPC contracts,
not a service):

| Technology                     | Services                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------- |
| Java 21 / Spring Boot / Gradle | `credit-card-order-service`                                                                 |
| Go / Go Modules                | `background-service`, `db-adapter`, `feature-flag-service`, `pricing-service`, `user-service` |
| TypeScript / Node.js / npm     | `frontend`, `loadgen`, `offer-service`                                                      |
| C# / .NET 8 / NuGet            | `broker-service`                                                                            |
| Config only (no packages)      | `reverse-proxy` (nginx), `db` (MSSQL and Postgres)                                          |

## Vulnerability remediation process

### Scanning

Run `snyk test --json --all-projects` from within each service directory that has a package manifest. Services without manifests (`reverse-proxy`, `db`) cannot be scanned this way.

Run scans in parallel across all services to save time.

### Grouping findings

Services that share the same technology will have identical vulnerable packages at identical versions. Identify these groups before fixing so the same change is applied consistently rather than service-by-service.

### Applying fixes

#### Java / Gradle

`src/credit-card-order-service/build.gradle` is the only Gradle manifest left in the repo.
Vulnerable dependencies that are not direct dependencies of the service are pinned explicitly in `build.gradle` under a clearly marked comment block:

```
// -- not direct dependencies but need bumps to patch vulns
// -- can be removed once the parent packages upgrade
```

Should another Java service be added, bump versions in this block across **all** affected `build.gradle` files in one pass.

#### Node.js / npm (services: `frontend`, `offer-service`)

- Bump the vulnerable package version constraint in `dependencies` in `package.json`.
- Pin transitive dependencies using the `overrides` field in `package.json`.
- Run `npm install` after editing `package.json` to regenerate `package-lock.json`.

#### Go (services: `background-service`, `db-adapter`, `feature-flag-service`, `pricing-service`, `user-service`)

Go stdlib vulnerabilities are fixed by upgrading the Go toolchain version, not by changing individual module dependencies. Three files must be updated in sync for each service:

1. **`go.mod`** — bump the `go` directive
2. **`Dockerfile`** — bump both the image tag and the pinned digest on the `FROM golang:…` builder stage
3. **`go.sum`** — regenerated automatically; run `go mod tidy` after editing `go.mod`

To get the correct digest for the new image:

```
docker pull golang:<new-version>-alpine3.24
docker inspect --format='{{index .RepoDigests 0}}' golang:<new-version>-alpine3.24
```

The Go services do not all share one base image - `db-adapter` pins `golang:1.26.5` while
the other four pin `golang:1.26.4` - so check each Dockerfile rather than reusing a single
digest across all five.

### Verifying fixes

For each updated service, run the local build to confirm nothing is broken:

- **Java / Gradle:** `./gradlew build` in the service directory
- **Node.js / npm:** `npm run build` in the service directory
- **Go:** `go build .` in the service directory
- **C# / .NET:** `dotnet build` in the service directory

Then re-run `snyk test --json --all-projects` from the repository root. All projects should exit `0` with zero vulnerabilities before committing.
