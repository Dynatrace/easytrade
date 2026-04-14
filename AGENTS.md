# EasyTrade — Agent Instructions

## Repository structure

`src/` contains 19 services grouped by technology:

| Technology                     | Services                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Java 21 / Spring Boot / Gradle | `accountservice`, `contentcreator`, `credit-card-order-service`, `engine`, `feature-flag-service`, `third-party-service` |
| Go / Go Modules                | `aggregator-service`, `pricing-service`, `problem-operator`                                                              |
| TypeScript / Node.js / npm     | `frontend`, `loadgen`, `offerservice`                                                                                    |
| C# / .NET 8 / NuGet            | `broker-service`, `loginservice`, `manager`                                                                              |
| Python / Poetry                | `db/user-generator` (local utility script, not a service)                                                                |
| Config only (no packages)      | `calculationservice` (C++, built in Dockerfile), `frontendreverseproxy` (nginx), `rabbitmq`, `db` (MSSQL)                |

## Vulnerability remediation process

### Scanning

Run `snyk test --json --all-projects` from within each service directory that has a package manifest. Services without manifests (`calculationservice`, `frontendreverseproxy`, `rabbitmq`) cannot be scanned this way.

Run scans in parallel across all services to save time.

### Grouping findings

Services that share the same technology will have identical vulnerable packages at identical versions. Identify these groups before fixing so the same change is applied consistently rather than service-by-service.

### Applying fixes

#### Java / Gradle (6 services share `build.gradle`)

Vulnerable dependencies that are not direct dependencies of the service are pinned explicitly in `build.gradle` under a clearly marked comment block:

```
// -- not direct dependencies but need bumps to patch vulns
// -- can be removed once the parent packages upgrade
```

Bump versions in this block across **all** affected `build.gradle` files in one pass.

#### Node.js / npm (services: `frontend`, `offerservice`)

- Bump the vulnerable package version constraint in `dependencies` in `package.json`.
- Pin transitive dependencies using the `overrides` field in `package.json`.
- Run `npm install` after editing `package.json` to regenerate `package-lock.json`.

#### Go (services: `pricing-service`, `problem-operator`)

Go stdlib vulnerabilities are fixed by upgrading the Go toolchain version, not by changing individual module dependencies. Three files must be updated in sync for each service:

1. **`go.mod`** — bump the `go` directive
2. **`Dockerfile`** — bump both the image tag and the pinned digest on the `FROM golang:…` builder stage
3. **`go.sum`** — regenerated automatically; run `go mod tidy` after editing `go.mod`

To get the correct digest for the new image:

```
docker pull golang:<new-version>-alpine3.23
docker inspect --format='{{index .RepoDigests 0}}' golang:<new-version>-alpine3.23
```

Both Go service Dockerfiles use the same base image, so one pull is sufficient for both.

### Verifying fixes

For each updated service, run the local build to confirm nothing is broken:

- **Java / Gradle:** `./gradlew build` in the service directory
- **Node.js / npm:** `npm run build` in the service directory
- **Go:** `go build .` in the service directory
- **C# / .NET:** `dotnet build` in the service directory

Then re-run `snyk test --json --all-projects` from the repository root. All projects should exit `0` with zero vulnerabilities before committing.
