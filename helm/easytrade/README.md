# Helm charts

## Description
Helm charts used to deploy *easytrade* on Kubernetes cluster using Helm 3+.

## Charts
List of helm charts:
- `easytrade` - Umbrella Helm chart to deploy multiple instances of `app` chart with different configuration.
- `easytrade/charts/app` - Helm chart for single microservice

## Installation

### Prerequisites
- Kubernetes 1.19+
- Helm 3.0+

### Install the chart

```bash
helm install $RELEASE_NAME oci://europe-docker.pkg.dev/dynatrace-demoability/helm/easytrade --version $CHART_VERSION
```

## Configuration

### Global Values

The following table lists the configurable global parameters and their default values.

| Parameter | Description | Default |
|-----------|-------------|---------|
| `global.image.baseRepository` | Base Docker registry URL for all services | `"europe-docker.pkg.dev/dynatrace-demoability/docker/easytrade"` |
| `global.image.tag` | Default image tag for all services | `latest` |
| `global.labels` | Additional labels to add to all resources | `{}` |
| `global.env` | Environment variables to add to all pods | `{}` |
| `global.dynatrace.version` | Dynatrace version identifier | `1.1.1` |

### Service Configuration

Each service can be configured individually. All services share the same configuration structure:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `<service>.enabled` | Enable/disable the service | `true` |
| `<service>.image.repository` | Override the image repository for this service | Uses `global.image.baseRepository/<service>` |
| `<service>.image.tag` | Override the image tag for this service | Uses `global.image.tag` |
| `<service>.replicaCount` | Number of replicas | `1` |
| `<service>.workloadType` | Workload type: `deployment` or `statefulset` | `deployment` |
| `<service>.env` | Environment variables (key-value pairs) | `{}` |
| `<service>.envFromSecret` | Environment variables from secrets | `{}` |
| `<service>.resources.requests` | Resource requests (CPU, memory) | Service-specific |
| `<service>.resources.limits` | Resource limits (CPU, memory) | Service-specific |
| `<service>.service.enabled` | Create Kubernetes Service | `false` |
| `<service>.service.port` | Service port | `80` |
| `<service>.service.ports` | Multiple ports configuration | `[]` |
| `<service>.service.annotations` | Service annotations | `{}` |
| `<service>.rbac.create` | Create RBAC resources | `false` |
| `<service>.rbac.rules` | RBAC rules for Role | `[]` |
| `<service>.persistence.enabled` | Enable persistence (for StatefulSet) | `false` |
| `<service>.persistence.size` | Persistent volume size | `10Gi` |
| `<service>.persistence.mountPath` | Mount path for persistent volume | `""` |

### Available Services

The easytrade chart includes the following microservices:

- `background-service` - Consolidated data aggregation, content/pricing generation, credit-card manufacture/courier simulation, and (Kubernetes-only) problem-pattern operator
- `broker-service` - Trading broker service
- `credit-card-order-service` - Credit card order processing
- `db` - Microsoft SQL Server database (StatefulSet)
- `db-adapter` - gRPC service exposing the database behind a stable interface (pluggable backend: MSSQL/Postgres)
- `feature-flag-service` - Feature flag management
- `frontend` - React frontend application
- `frontend-reverse-proxy` - Nginx reverse proxy
- `load-gen` - Load generator
- `offer-service` - Offer management
- `pricing-service` - Pricing calculation
- `problem-operator` - Problem pattern simulator
- `user-service` - Account and authentication service

### Example Configurations

#### Minimal installation with specific services

```yaml
global:
  image:
    tag: "v1.0.0"

# Enable only core services
user-service:
  enabled: true
broker-service:
  enabled: true
db:
  enabled: true
frontend:
  enabled: true
frontend-reverse-proxy:
  enabled: true

# Disable all other services
background-service:
  enabled: false
load-gen:
  enabled: false
# ... etc
```

#### Custom environment variables

```yaml
global:
  env:
    DT_RELEASE_STAGE: production
    DT_RELEASE_VERSION: "1.2.3"
  labels:
    environment: prod
    team: platform

broker-service:
  enabled: true
  env:
    CUSTOM_CONFIG: "value"
    LOG_LEVEL: "debug"
```

#### Database with persistence

```yaml
db:
  enabled: true
  workloadType: statefulset
  persistence:
    enabled: true
    size: 50Gi
    mountPath: /var/opt/mssql
  resources:
    requests:
      cpu: 500m
      memory: 2Gi
    limits:
      cpu: "2"
      memory: 4Gi
```

#### Service with RBAC

```yaml
background-service:
  enabled: true
  rbac:
    create: true
    rules:
      - apiGroups: [""]
        resources: ["services", "pods", "events"]
        verbs: ["get", "list", "watch", "create", "delete", "patch", "update"]
      - apiGroups: ["apps"]
        resources: ["deployments", "replicasets"]
        verbs: ["get", "list", "watch", "create", "delete", "patch", "update"]
```

#### Multiple ports configuration

```yaml
<service>:
  enabled: true
  service:
    enabled: true
    ports:
      - port: 8080
        targetPort: 8080
        protocol: TCP
        name: http
      - port: 9090
        targetPort: 9090
        protocol: TCP
        name: metrics
```

## Upgrading

```bash
helm upgrade easytrade ./helm/easytrade -n easytrade -f custom-values.yaml
```

## Uninstalling

```bash
helm uninstall easytrade -n easytrade
```

## Development

The root `Makefile` wraps the commands below. Each `helm-*` target resolves the
subchart dependencies first, so you can't forget that step:

```bash
make helm-template   # deps + render manifests to stdout
make helm-install    # deps + upgrade --install from this local chart
make helm-uninstall
```

Release name, namespace and chart path are overridable:
`make helm-lint HELM_CHART=helm/easytrade`.

### Update dependencies

Required before linting, templating or installing — the umbrella chart declares 16
`file://./charts/app` dependencies that must be packaged into `charts/` first.

```bash
helm dependency update helm/easytrade
```

This writes `Chart.lock` and `charts/app-0.1.0.tgz`; both are build artifacts and
are gitignored.

### Lint the chart

```bash
helm lint helm/easytrade
```

### Template rendering

```bash
# Render templates to verify output
helm template easytrade ./helm/easytrade -f values.yaml

# Debug mode
helm install easytrade ./helm/easytrade --dry-run --debug
```

## References
- https://helm.sh/docs/howto/charts_tips_and_tricks/#complex-charts-with-many-dependencies
- [Helm Documentation](https://helm.sh/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/home/)
