# easyTradeProblemOperator

Kubernetes operator for easyTrade that automatically makes changes to the deployment based on feature flags turned on. It repeatedly checks the current state of resources and feature flags. Information on whether the new configuration has been applied is saved in the custom annotation. The code that defines to which resource and how the changes should be applied is located in a custom controller.

## Technologies used

- Golang 1.23
- [Go client for Kubernetes](https://github.com/kubernetes/client-go)

## Implemented Controllers

| Controller             | Flag           | Resource                    | Description      |
| ---------------------- | -------------- | --------------------------- | ---------------- |
| HighCpuUsageController | high_cpu_usage | broker-service (deployment) | Sets a CPU limit |

### High CPU Usage controller for broker-service

When the `high_cpu_usage` feature flag is turned on, a CPU limits is applied to the broker-service deployment.

#### Configuration

This controller behavior can be altered using environment variables:

| Name                                    | Description                                                          | Default |
| --------------------------------------- | -------------------------------------------------------------------- | ------- |
| HIGH_CPU_USAGE_BROKER_SERVICE_CPU_LIMIT | CPU resource value that should be applied during the problem pattern | 300m    |
