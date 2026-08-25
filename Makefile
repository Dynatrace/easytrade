# EasyTrade developer entrypoint.
#
# Run `make help` for the list of targets.
#
# Every compose target accepts an optional `services=` (or `SERVICES=`) to narrow
# the scope. Omit it to act on the whole stack:
#
#   make build                        # build all images from local source
#   make build services=frontend       # build one
#   make start services="db frontend"  # start a subset
#
# `.env` at the repo root is picked up by docker compose automatically and
# supplies REGISTRY, TAG and the DB_* variables.

DOCKER_COMPOSE_CMD ?= docker compose

# Builds from local source, publishes per-service host ports. The dev stack.
COMPOSE_DEV_FILE   ?= compose.dev.yaml
# Runs pre-built images pulled from the registry.
COMPOSE_FILE       ?= compose.yaml
# Builds and tags images as ${REGISTRY}/<service>:${TAG}. What CI uses.
COMPOSE_BUILD_FILE ?= compose.build.yaml

HELM_RELEASE   ?= easytrade
HELM_NAMESPACE ?= easytrade
HELM_CHART     ?= helm/easytrade
HELM_CHART_OCI ?= oci://europe-docker.pkg.dev/dynatrace-demoability/helm/easytrade

# Accept `services=` or `SERVICES=`. Empty means "all services".
ifdef SERVICES
services := $(SERVICES)
endif

# Targets that act on exactly one service have nothing sensible to do without it.
define require_service
@test -n "$(services)" || { \
	echo "error: '$@' needs a service, e.g. make $@ services=frontend"; \
	exit 1; \
}
endef

.DEFAULT_GOAL := help

##@ General

.PHONY: help
help: ## Show this help
	@awk 'BEGIN { FS = ":.*##" } \
		/^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5); next } \
		/^[a-zA-Z0-9_-]+:.*##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 }' \
		$(MAKEFILE_LIST)
	@echo ""
	@echo "Narrow any compose target with service=<name> (or a quoted list)."
	@echo ""

##@ Build

.PHONY: build
build: ## Build images from local source (compose.dev.yaml)
	$(DOCKER_COMPOSE_CMD) -f $(COMPOSE_DEV_FILE) build $(services)

##@ Docker compose

.PHONY: start
start: ## Start the stack from local source, building as needed
	$(DOCKER_COMPOSE_CMD) -f $(COMPOSE_DEV_FILE) up --detach --remove-orphans $(services)
	@echo ""
	@echo "EasyTrade is starting. It may take a few minutes to stabilise."
	@echo "  App           http://localhost"
	@echo ""
	@echo "Dev logins: demouser/demopass, james_norton/pass_james_123"
	@echo ""

.PHONY: start-remote
start-remote: ## Start the stack from pre-built registry images (compose.yaml)
	$(DOCKER_COMPOSE_CMD) -f $(COMPOSE_FILE) up --detach --remove-orphans $(services)
	@echo ""
	@echo "EasyTrade is starting at http://localhost"
	@echo ""

.PHONY: stop
stop: ## Stop the stack and remove its containers
	$(DOCKER_COMPOSE_CMD) -f $(COMPOSE_DEV_FILE) down --remove-orphans

.PHONY: restart
restart: ## Recreate one service without rebuilding it (service= required)
	$(require_service)
	$(DOCKER_COMPOSE_CMD) -f $(COMPOSE_DEV_FILE) up --detach --force-recreate $(services)

.PHONY: redeploy
redeploy: ## Rebuild and recreate one service after a code change (service= required)
	$(require_service)
	$(DOCKER_COMPOSE_CMD) -f $(COMPOSE_DEV_FILE) up --detach --build --force-recreate $(services)

.PHONY: clean
clean: ## Stop the stack and delete its volumes and locally built images
	$(DOCKER_COMPOSE_CMD) -f $(COMPOSE_DEV_FILE) down --remove-orphans --volumes --rmi local

##@ Kubernetes (Helm)

.PHONY: k8s-install
k8s-install: ## Install or upgrade the deployment from the local chart
	helm upgrade --install $(HELM_RELEASE) $(HELM_CHART) \
		--namespace $(HELM_NAMESPACE) --create-namespace

.PHONY: k8s-install-remote
k8s-install-remote: ## Install or upgrade from the published chart in the registry
	helm upgrade --install $(HELM_RELEASE) $(HELM_CHART_OCI) \
		--namespace $(HELM_NAMESPACE) --create-namespace

.PHONY: k8s-uninstall
k8s-uninstall: ## Uninstall the deployment
	helm uninstall $(HELM_RELEASE) --namespace $(HELM_NAMESPACE)

##@ Protobuf

# Service dirs equipped with their own `proto` target (e.g. src/db-adapter/Makefile).
PROTO_SERVICE_DIRS := $(patsubst src/%/Makefile,%,$(shell grep -l '^proto:' src/*/Makefile 2>/dev/null))

.PHONY: generate-proto
generate-proto: ## Generate code from protobuf definitions (runs each equipped service's own `make proto`)
	@dirs="$(if $(service),$(service),$(PROTO_SERVICE_DIRS))"; \
	if [ -z "$$dirs" ]; then \
		echo "No service Makefiles with a 'proto' target found under src/*/Makefile."; \
		exit 0; \
	fi; \
	for dir in $$dirs; do \
		echo "==> src/$$dir"; \
		$(MAKE) --no-print-directory -C src/$$dir proto || exit 1; \
	done

##@ Graph

.PHONY: update-graph
update-graph: ## Generate and update mermaid graph of service dependencies (README.md)
	python3 scripts/dependency-graph/generate.py
