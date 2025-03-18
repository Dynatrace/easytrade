# easyTradeProblemOperator

Kubernetes operator for easyTrade that automatically makes changes to the deployment based on feature flags turned on. It repeatedly checks the current state of resources and feature flags. Information on whether the new configuration has been applied is saved in the custom annotation. The code that defines to which resource and how the changes should be applied is located in a custom controller, which should implement the [`operator.Controller`](./operator/controller.go) interface. Each controller instance should define conditions for a single resource when a specific flag is turned on.

## Technologies used

- Golang 1.23
- [Go client for Kubernetes](https://github.com/kubernetes/client-go)

## Local build instructions

```bash
docker build -t IMAGE_NAME .
docker run -d --name SERVICE_NAME IMAGE_NAME
```

If you want the service to work properly, you should try setting these ENV variables:

| Name                          | Description                                                                                                                  | Default              |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| SYNC_INTERVAL                 | (optional) Defines how often should the state be updated                                                                     | 5s                   |
| POD_NAMESPACE                 | Contains the name of the namespace where easyTrade is deployed. It should be configured to be automatically injected by k8s. | easytrade            |
| FEATURE_FLAG_SERVICE_PROTOCOL | Feature Flag Service protocol                                                                                                | http                 |
| FEATURE_FLAG_SERVICE_BASE_URL | Base Feature Flag Service URL                                                                                                | feature-flag-service |
| FEATURE_FLAG_SERVICE_PORT     | Feature Flag Service port                                                                                                    | 8080                 |

# Controllers

A controller should define how a single resource should be modified when a feature flag is turned on, and how it should be rolled back. It should have these methods implemented:

```go
ApplyChange(ctx context.Context, namespace string, client kubernetes.Interface, obj Object) error
RollbackChange(ctx context.Context, namespace string, clients kubernetes.Interface, obj Object) error
UpdateResource(ctx context.Context, namespace string, client kubernetes.Interface, obj Object) error
GetResource(ctx context.Context, namespace string, client kubernetes.Interface) (obj Object, err error)
GetFlagName() string
```

- `ApplyChange` is called when the flag is turned on and the resource changes are not applied.
- `RollbackChange` is called when the flag is turned off and the resource state is applied.
- `UpdateResource` is called after Apply and Rollback, it should save the resource changes.
- `GetResource` should return the resource controlled.
- `GetFlagName` should return string containing the flag name that triggers the controller.

The [`Object`](./operator/controller.go) interface is used by the operator internally. Resources such as `deployment.apps`, `replicaset.apps`, `service` or `pod` all implements it.

Controllers should be located in the [`controllers`](./controllers/) directory. You can create a new package for each feature flag and place shared code in the [`common.go`](./controllers/common.go). A template for creating a new controller can be found in the [`template`](./examples/template/template.go) package.

After creating a new controller, it has to be registered to the operator. Add code similar to this to [`main.go`](./main.go).

```go
controller := &controllers.MyController{l: logger.Named("My Controller")}
 //        or
controller := controllers.NewMyController(logger.Named("My Controller"))

operator.RegisterController(controller)
```

Controllers defined for the same flag are run in parallel inside an errgroup. If one fails, others are cancelled too (if possible). Controller groups defined for different flags run sequentially to reduce the possibility of conflicts. If a conflict occurs, the action will be retried. If the synchronization doesn't finish before the next one starts, all actions will be cancelled, and the synchronization interval will be extended by 10% to ensure actions are being completed successfully before timing out.

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
