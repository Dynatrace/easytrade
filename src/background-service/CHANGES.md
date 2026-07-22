# Task: Merge four EasyTrade services into `background-service`

## Context

EasyTrade is a microservices demo application. Four existing services currently
run as separate processes:

- `aggregator-service` (Go) — generates synthetic traffic against other
  services over REST (50% JSON / 50% XML); has no direct database access.
- `contentcreator` (Java / Spring Boot / Gradle)
- `problem-operator` (Go) — Kubernetes-only controller (`k8s.io/client-go`)
  that watches feature flags and applies chaos/problem patterns to the
  cluster. It is not present in `compose.yaml`/`compose.dev.yaml`. since this one only makes sense on k8s deployment (at least in current state) there should be a mechanism to disable it, like checking for an env-var that is only set when deployed to k8s
- `third-party-service` (Java / Spring Boot / Gradle)

A new service, `background-service`, has already been scaffolded in Go at
`src/background-service/`, with a placeholder package per source service:
`aggregator/`, `content-creator/`, `problem-operator/`, `third-party/`, plus a
shared `utils/` package.

## Objective

Design and implement a plan to consolidate all four source services into
`background-service`, preserving 100% of their existing functionality while
eliminating duplication and reducing overall resource consumption. This is a
**merge and simplification**, not a feature cut — nothing user-visible or
functionally load-bearing may be dropped. The target language for
`background-service` is Go (per the existing scaffold), so the two Java
services (`contentcreator`, `third-party-service`) must be ported to Go as
part of the merge.

## Requirements

1. **Full functional parity** — every capability currently provided by
   `aggregator-service`, `contentcreator`, `problem-operator`, and
   `third-party-service` must exist in `background-service` after the merge.
   Do not remove functionality solely to simplify scope.
2. **De-duplication** — where two or more of the four services implement the
   same or overlapping functionality (e.g. HTTP client helpers, config
   loading, logging, retry logic, feature-flag polling), consolidate it into
   a single shared implementation (e.g. under `utils/`) used by all
   consumers. Do not leave copies of the same logic in multiple packages.
3. **Resource efficiency** — the merged service should be as lightweight as
   possible (memory/CPU footprint, binary size, number of running
   goroutines/background loops). Prefer shared schedulers/workers over one
   per former service where behavior allows.
4. **Directory structure** — the current scaffold
   (`aggregator/`, `content-creator/`, `problem-operator/`, `third-party/`,
   `utils/`) is a starting point, not a fixed requirement. Propose a better
   structure if one would be clearer or easier to maintain, and justify the
   change before applying it.
5. **Documentation** — document the merged service thoroughly: a top-level
   README explaining what `background-service` does and how it maps to the
   four original services, plus package-level doc comments for any non-obvious
   logic. Follow the Go documentation conventions already used elsewhere in
   this repo.
6. **Cross-service reference cleanup** — before deleting or replacing
   anything, research how the four source services are referenced elsewhere
   in the repository:
   - Other services calling their REST endpoints
   - `compose.yaml` / `compose.dev.yaml` entries
   - `frontendreverseproxy` (nginx) routing rules
   - Helm charts / Kubernetes manifests
   - Any Monaco configs or feature-flag definitions tied to them
   Update every reference to point at `background-service` instead. Do not
   remove a reference until you've confirmed nothing else depends on it.
7. **Dead code removal** — if research in (6) reveals functionality in any
   of the four services that is genuinely unused by anything else in the
   system, remove it during the port instead of carrying it forward.

## Deliverables

1. A written implementation plan covering:
   - Final proposed directory/package structure for `background-service`
   - Mapping of each existing endpoint/feature/background job to its new
     location
   - List of duplicated functionality identified and how it will be
     consolidated
   - List of cross-service references that need updating, per consuming
     service
2. The implemented merge in `background-service`, matching the approved plan.
3. Updated references in all other affected services/configs.
4. Updated documentation (README + code comments).

## Acceptance Criteria

- `background-service` builds and passes tests (`go build .`, `go test ./...`).
- No functionality present in the four original services is missing from
  `background-service`.
- No duplicated implementations of the same logic remain across the merged
  packages.
- No other service, compose file, proxy config, or Helm chart still
  references the four original services by their old names/paths unless a
  reference is intentionally kept (with justification).
- The merged service is documented well enough that a new contributor can
  understand which original service each part replaces.
