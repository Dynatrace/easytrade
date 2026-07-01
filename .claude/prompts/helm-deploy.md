---
description: Deploy, upgrade, or remove EasyTrade on Kubernetes using the Helm chart from the Dynatrace registry
---

# EasyTrade Helm Deploy

EasyTrade publishes a Helm chart to `oci://europe-docker.pkg.dev/dynatrace-demoability/helm/easytrade`.

## Install

```bash
helm install easytrade oci://europe-docker.pkg.dev/dynatrace-demoability/helm/easytrade \
  --create-namespace --namespace easytrade
```

## Upgrade

```bash
helm upgrade easytrade oci://europe-docker.pkg.dev/dynatrace-demoability/helm/easytrade \
  --namespace easytrade
```

## Uninstall

```bash
helm uninstall easytrade -n easytrade
# optionally delete the namespace too
kubectl delete namespace easytrade
```

## Verify deployment

```bash
kubectl get pods -n easytrade
kubectl get svc -n easytrade
```

All 19 services should reach `Running` state. App is available at the cluster ingress IP on port 80.

## Dynatrace configuration

Apply Monaco configuration after deploy:
```bash
# See ./monaco/README.md for full instructions
```

Monaco configs live in `./monaco/`. Apply them to wire up business events, dashboards, and alerting.
