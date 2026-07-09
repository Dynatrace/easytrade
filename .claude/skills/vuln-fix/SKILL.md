---
name: vuln-fix
description: >
  Dependency vulnerability fix workflow for EasyTrade across all four stacks — Java/Gradle,
  Go, Node.js/npm, and .NET — in a single consistent pass. Trigger phrases: "fix vulnerability",
  "patch CVE", "bump dependency", "fix vuln", "dependency security fix", "transitive dep bump".
model: sonnet
tools: Read, Edit, Bash, Grep, Glob
---

You are fixing a dependency vulnerability across EasyTrade's polyglot stack. A vuln often
spans multiple services — fix all affected services in one pass; partial fixes leave the
repo inconsistent.

## Java / Gradle

Transitive dep bumps go in the marked block in each `build.gradle`:

```groovy
// -- not direct dependencies but need bumps to patch vulns
// -- can be removed once the parent packages upgrade
implementation 'org.example:library:X.Y.Z'
```

**Affected services** (all share the same `build.gradle` structure):
`accountservice`, `contentcreator`, `credit-card-order-service`, `engine`, `feature-flag-service`, `third-party-service`

Apply the same bump to **all six** `build.gradle` files. Never patch one and leave others behind.

Verify:
```bash
# Run from each affected service directory
./gradlew dependencies | grep '<library-name>'
./gradlew build
```

## Go

stdlib or module vulns require three changes per service (`aggregator-service`, `pricing-service`, `problem-operator`):

1. Bump the `go` directive in `go.mod`:
   ```
   go 1.26.4   # or whatever the patched version is
   ```
2. Bump the builder image tag **and digest** in `Dockerfile`:
   ```dockerfile
   FROM golang:1.26.4-alpine3.24@sha256:<new-digest> AS build
   ```
3. Run tidy:
   ```bash
   go mod tidy
   ```

Verify:
```bash
go build .
go test ./...
```

## Node.js / npm

Use `overrides` in `package.json` — never `resolutions`. Applies to `frontend`, `loadgen`, `offerservice`.

```json
{
  "overrides": {
    "vulnerable-package": "X.Y.Z"
  }
}
```

Then:
```bash
npm install
npm audit   # should show 0 high/critical
```

## .NET / NuGet

Bump the affected `PackageReference` version in the `.csproj` file. Applies to `broker-service`, `loginservice`, `manager`.

```xml
<PackageReference Include="VulnerablePackage" Version="X.Y.Z" />
```

Verify:
```bash
# Run from src/<service>/<ServiceName>/
dotnet build
dotnet test
```

## Checklist before declaring done

- [ ] All affected services in the stack patched (not just one)
- [ ] Build passes for every patched service
- [ ] No new test failures introduced
- [ ] `go mod tidy` run for Go services (keeps `go.sum` clean)
- [ ] `npm install` run for Node services (updates `package-lock.json`)
- [ ] Dockerfile digest updated for Go builder image (prevents stale image pulls)
