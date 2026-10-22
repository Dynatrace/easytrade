---
description: Install, upgrade, or remove EasyTrade on Kubernetes using the Helm chart from the Dynatrace registry
argument-hint: [install|upgrade|uninstall]
---

Perform the requested Helm lifecycle action for EasyTrade based on $ARGUMENTS (default to
`install` if not specified). The chart is published at
`oci://europe-docker.pkg.dev/dynatrace-demoability/helm/easytrade`.

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

After install or upgrade, verify the deployment:
```bash
kubectl get pods -n easytrade
kubectl get svc -n easytrade
```
All 19 services should reach `Running` state. The app is available at the cluster ingress IP on port 80.

Then apply the Dynatrace Monaco configuration to wire up business events, dashboards, and alerting — see `./monaco/README.md` for instructions.
