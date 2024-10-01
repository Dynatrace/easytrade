# easyTradeProblemOperator

Kubernetes operator for easyTrade that automatically makes changes to the deployment based on feature flags turned on. It repeatedly checks the current state of resources and feature flags. Information on whether the new configuration has been applied is saved in the custom annotation. The code that defines to which resource and how the changes should be applied is located in a custom controller.

## Technologies used

- Golang 1.23
- [Go client for Kubernetes](https://github.com/kubernetes/client-go)
