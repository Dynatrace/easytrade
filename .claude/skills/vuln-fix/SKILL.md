---
name: vuln-fix
description: >
  Dependency vulnerability fix workflow for EasyTrade across all stacks — Java/Gradle,
  Go, Node.js/npm, .NET and base images — in a single consistent pass. Trigger phrases: "fix vulnerability",
  "patch CVE", "bump dependency", "fix vuln", "dependency security fix", "transitive dep bump", "snyk audit".
model: sonnet
tools: Read, Edit, Bash, Grep, Glob
---

You are fixing dependency vulnerabilities across EasyTrade's polyglot stack. A vuln often
spans multiple services — fix all affected services in one pass; partial fixes leave the
repo inconsistent. `AGENTS.md` is the authority on the process; this skill is the checklist.

## Current services (12, under `src/`)

| Stack | Services | Manifest |
|---|---|---|
| Java 21 / Gradle | `credit-card-order-service` | `build.gradle` |
| Go | `background-service`, `db-adapter`, `feature-flag-service`, `pricing-service`, `user-service` | `go.mod` |
| Node / npm | `frontend`, `loadgen`, `offer-service` | `package.json` |
| .NET 10 | `broker-service` | `src/BrokerService.csproj`, `test/BrokerService.test.csproj` |
| Config only | `reverse-proxy` (nginx), `db` | Dockerfile only — not scannable by `snyk test` |

`src/proto/` holds shared gRPC contracts and is not a service. If this table drifts from
`src/`, flag it (see CLAUDE.md "Self-Healing").

## 1. Scan

Run from each service directory, in parallel. Write JSON to the scratchpad, not the repo.

```bash
cd src/<service> && snyk test --json --all-projects > <scratchpad>/<service>.json
```

- Exit 0 = clean, 1 = vulns found, 2/3 = scan failed (read the `error` field; do not treat as clean).
- Group findings by stack first: services of the same stack share vulnerable packages.
- `reverse-proxy`/`db` are not scanned — their base images (nginx, postgres, mssql) are bumped by hand in the Dockerfile.
  `frontend` also uses an nginx image: keep its tag+digest identical to `reverse-proxy`'s.

### .NET scanning prerequisites

`snyk test` on `broker-service` runs `dotnet run` internally and needs a working **.NET 10 SDK**
(`global.json` is absent; the csproj targets `net10.0`). Run `dotnet restore BrokerService.sln` first so
`obj/project.assets.json` exists. If `dotnet --list-sdks` has no 10.x, install it with Microsoft's
`dotnet-install.sh --channel 10.0 --install-dir ~/.dotnet` and make sure `DOTNET_ROOT=$HOME/.dotnet`
and `~/.dotnet` are on `PATH`.

## 2. Fix

### Java / Gradle (`credit-card-order-service`)

Prefer, in order:
1. **Bump the Spring Boot plugin** (`id 'org.springframework.boot' version '…'`) when a newer Boot release
   already ships the patched Spring Framework (and other BOM-managed libs). Verify with the
   `spring-boot-dependencies` POM on Maven Central (`<spring-framework.version>`). This is cleaner than pins.
2. Otherwise pin the transitive dep in the marked block:

```groovy
// -- not direct dependencies but need bumps to patch vulns
// -- can be removed once the parent packages upgrade
implementation 'org.example:library:X.Y.Z'
```

When a plugin bump makes a pin redundant, remove the pin. If another Java service is added, apply every
bump to **all** `build.gradle` files in one pass.

Verify: `./gradlew build` and `./gradlew dependencies --configuration runtimeClasspath | grep <lib>`.

### Go (5 services)

stdlib vulns are fixed by the toolchain version. Per service, three things stay in sync:
1. `go` directive in `go.mod`
2. builder image tag **and digest** in `Dockerfile` (`FROM golang:<ver>-alpine3.24@sha256:… AS build`)
3. `go mod tidy`

Get the digest: `docker pull golang:<ver>-alpine3.24 && docker inspect --format='{{index .RepoDigests 0}}' golang:<ver>-alpine3.24`.
All five normally share one digest, but check each Dockerfile — they have drifted before.
Do not move to a Go minor (e.g. 1.27) until the Dynatrace OneAgent version on our tenants supports it.

Verify: `go build .` and `go test ./...` in each service.

### Node / npm (`frontend`, `loadgen`, `offer-service`)

- Direct dependency vulnerable → bump its version in `dependencies`/`devDependencies`.
- Transitive → `overrides` in `package.json` (never `resolutions`). When bumping an existing override,
  check `npm view <pkg> dist-tags` — an old override can itself be inside a newly-vulnerable range.
- Run `npm install` afterwards to regenerate `package-lock.json`.

Verify: `npm run build`, `npm test`/`npm run lint` where defined, and `npm audit`. Snyk is the gate;
`npm audit` findings that Snyk does not report and that need a breaking major bump of dev tooling (e.g. eslint)
should be reported to the user, not forced with `npm audit fix --force`.

### .NET (`broker-service`)

Bump the affected `PackageReference` in `src/BrokerService.csproj` (or the test csproj).
Verify from `src/broker-service/`: `dotnet build BrokerService.sln` and `dotnet test`.
Base image bumps (`mcr.microsoft.com/dotnet/sdk` / `aspnet`) go in `Dockerfile`, tag + digest together.

### Base images

Always bump `tag@sha256:digest` together; never leave a tag without its digest.

## 3. Findings you should not "fix"

- **License-only findings** (e.g. `javax.annotation-api` CDDL/GPL, `compileOnly`) have no fix version and are
  not security vulnerabilities. Report them; don't remove dependencies to silence them.
- Findings with `fixedIn: None` — report, don't invent a workaround.

## 4. Verify and finish

- [ ] Every affected service in the stack patched (not just one)
- [ ] Build passes for every patched service (and tests where they exist)
- [ ] `go mod tidy` run for Go; `npm install` run for Node (lockfile updated)
- [ ] Image tag and digest updated together
- [ ] Re-run `snyk test --all-projects` per service: exit 0 / no vulnerable paths, except documented license-only findings
- [ ] Report anything you could not scan or fix; do not commit unless asked
