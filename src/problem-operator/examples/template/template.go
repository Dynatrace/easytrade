package template

import (
	"context"
	"fmt"

	controllers "dynatrace.com/easytrade/problem-operator/examples"
	"dynatrace.com/easytrade/problem-operator/operator"
	"go.uber.org/zap"
	appsv1 "k8s.io/api/apps/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

const (
	deploymentName = "my-deployment"
	flagName       = "my-flag"
)

type MyController struct {
	logger *zap.SugaredLogger
}

func New(l *zap.SugaredLogger) *MyController {
	return &MyController{logger: l}
}

func (c *MyController) ApplyChange(
	ctx context.Context,
	namespace string,
	client kubernetes.Interface,
	obj operator.Object,
) error {
	deployment, found := obj.(*appsv1.Deployment)
	if !found {
		return fmt.Errorf("unable to cast %s object to appsv1.Deployment: %w", obj.GetName(), controllers.ErrObjectCast)
	}

	/* apply the changes */

	c.logger.Infof("Applied changes the %s deployment", deployment.GetName())

	return nil
}

func (c *MyController) RollbackChange(
	ctx context.Context,
	namespace string,
	client kubernetes.Interface,
	obj operator.Object,
) error {
	deployment, ok := obj.(*appsv1.Deployment)
	if !ok {
		return fmt.Errorf("unable to cast %s object to appsv1.Deployment: %w", obj.GetName(), controllers.ErrObjectCast)
	}

	/* roll back the changes */

	c.logger.Infof("Successfully rolled back the %s deployment", deployment.GetName())

	return nil
}

func (c *MyController) UpdateResource(
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

func (c *MyController) GetResource(
	ctx context.Context,
	namespace string,
	client kubernetes.Interface,
) (operator.Object, error) {
	deployment, err := client.AppsV1().Deployments(namespace).Get(ctx, deploymentName, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get the deployment: %w", err)
	}

	c.logger.Infof("Successfully got the %s deployment", deployment.GetName())

	return deployment, nil
}

func (c *MyController) GetFlagName() string {
	return flagName
}
