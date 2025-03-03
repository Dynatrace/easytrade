package highcpuusage

import (
	"context"
	"fmt"
	"os"

	"dynatrace.com/easytrade/problem-operator/controllers"
	"dynatrace.com/easytrade/problem-operator/operator"
	"go.uber.org/zap"
	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

const (
	brokerService = "broker-service"
	highCpuUsage  = "high_cpu_usage"

	cpuLimitValueDefault = "300m"
	cpuLimitValueEnv     = "HIGH_CPU_USAGE_BROKER_SERVICE_CPU_LIMIT"
)

type BrokerController struct {
	logger *zap.SugaredLogger
}

func NewBrokerController(l *zap.SugaredLogger) *BrokerController {
	return &BrokerController{logger: l}
}

func (c *BrokerController) ApplyChange(
	_ context.Context,
	_ string,
	_ kubernetes.Interface,
	obj operator.Object,
) error {
	deployment, found := obj.(*appsv1.Deployment)
	if !found {
		return fmt.Errorf("unable to cast %s object to appsv1.Deployment: %w", obj.GetName(), controllers.ErrObjectCast)
	}

	cpuLimitStr, found := os.LookupEnv(cpuLimitValueEnv)
	if !found {
		cpuLimitStr = cpuLimitValueDefault
	}

	cpuLimit, err := resource.ParseQuantity(cpuLimitStr)
	if err != nil {
		return fmt.Errorf("can't use %s as resource quantity: %w", cpuLimit.String(), err)
	}

	containers := deployment.Spec.Template.Spec.Containers
	for i := range containers {
		limits := &containers[i].Resources.Limits
		if *limits == nil {
			*limits = corev1.ResourceList{}
		}

		(*limits)[corev1.ResourceCPU] = cpuLimit
	}

	c.logger.Infof("Applied new cpu limit to the %s deployment (%s)", deployment.GetName(), cpuLimit.String())

	return nil
}

func (c *BrokerController) RollbackChange(
	ctx context.Context,
	namespace string,
	client kubernetes.Interface,
	obj operator.Object,
) error {
	deployment, ok := obj.(*appsv1.Deployment)
	if !ok {
		return fmt.Errorf("unable to cast %s object to appsv1.Deployment: %w", obj.GetName(), controllers.ErrObjectCast)
	}

	err := controllers.RollbackDeployment(ctx, c.logger, namespace, client, deployment)
	if err != nil {
		return fmt.Errorf("failed to roll back the resource %s: %w", deployment.GetName(), err)
	}

	c.logger.Infof("Successfully rolled back the %s deployment", deployment.GetName())

	return nil
}

func (c *BrokerController) UpdateResource(
	ctx context.Context,
	namespace string,
	client kubernetes.Interface,
	obj operator.Object,
) error {
	deployment, ok := obj.(*appsv1.Deployment)
	if !ok {
		return fmt.Errorf("unable to cast %s object to appsv1.Deployment: %w", obj.GetName(), controllers.ErrObjectCast)
	}

	_, err := client.AppsV1().Deployments(namespace).Update(ctx, deployment, metav1.UpdateOptions{})
	if err != nil {
		return fmt.Errorf("failed to update the resource %s: %w", deployment.GetName(), err)
	}

	return nil
}

func (c *BrokerController) GetResource(
	ctx context.Context,
	namespace string,
	client kubernetes.Interface,
) (operator.Object, error) {
	deployment, err := client.AppsV1().Deployments(namespace).Get(ctx, brokerService, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get the deployment: %w", err)
	}

	c.logger.Infof("Successfully got the %s deployment", deployment.GetName())

	return deployment, nil
}

func (c *BrokerController) GetFlagName() string {
	return highCpuUsage
}
