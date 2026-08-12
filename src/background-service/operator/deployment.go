package operator

import (
	"context"
	"errors"
	"fmt"
	"strconv"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/util/retry"
)

const (
	revisionAnnotation = "deployment.kubernetes.io/revision"
	appLabel           = "app.kubernetes.io/name=" + brokerService
)

var (
	ErrRevisionAnnotationNotFound = fmt.Errorf("revision annotation %s not found", revisionAnnotation)
	ErrNoPreviousReplicaSet       = errors.New("no previous replicaset found")
)

func (o *Operator) reconcile(ctx context.Context, flag *Flag) error {
	return retry.RetryOnConflict(retry.DefaultRetry, func() error {
		return o.reconcileOnce(ctx, flag)
	})
}

func (o *Operator) reconcileOnce(ctx context.Context, flag *Flag) error {
	if err := ctx.Err(); err != nil {
		return fmt.Errorf("context cancelled while reconciling: %w", err)
	}

	deployment, err := o.client.AppsV1().Deployments(o.namespace).Get(ctx, brokerService, metav1.GetOptions{})
	if err != nil {
		return fmt.Errorf("failed to get the deployment for the %q flag: %w", flag.ID, err)
	}

	state := getObjectState(flag, deployment)

	l := o.logger.With("flag", flag.ID, "enabled", flag.Enabled)

	switch state {
	case ShouldApply:
		l.Infof("Applying changes to the %s", deployment.GetName())
		o.recordEvent(deployment, "FlagApply", fmt.Sprintf("Applying changes from the %q flag", flag.ID))

		setFlagAnnotation(flag, deployment, annotationValueOn)
		err = o.applyChange(deployment)

	case ShouldRollback:
		l.Infof("Rolling back changes of the %s", deployment.GetName())
		o.recordEvent(deployment, "FlagRollback", fmt.Sprintf("Rolling back changes from the %q flag", flag.ID))

		setFlagAnnotation(flag, deployment, annotationValueOff)
		err = o.rollbackChange(ctx, deployment)

	case Synchronized:
		l.Infof("State of the %s is synchronized", deployment.GetName())
	}

	if err != nil {
		return fmt.Errorf("failed to apply changes to the %s's state: %w", deployment.GetName(), err)
	}

	if _, err := o.client.AppsV1().Deployments(o.namespace).Update(ctx, deployment, metav1.UpdateOptions{}); err != nil {
		return fmt.Errorf("failed to update the %s resource: %w", deployment.GetName(), err)
	}

	return nil
}

func (o *Operator) applyChange(deployment *appsv1.Deployment) error {
	cpuLimit, err := resource.ParseQuantity(o.cpuLimit)
	if err != nil {
		return fmt.Errorf("can't use %s as resource quantity: %w", o.cpuLimit, err)
	}

	containers := deployment.Spec.Template.Spec.Containers
	for i := range containers {
		limits := &containers[i].Resources.Limits
		if *limits == nil {
			*limits = corev1.ResourceList{}
		}

		(*limits)[corev1.ResourceCPU] = cpuLimit
	}

	o.logger.Infof("Applied new cpu limit to the %s deployment (%s)", deployment.GetName(), cpuLimit.String())

	return nil
}

func (o *Operator) rollbackChange(ctx context.Context, deployment *appsv1.Deployment) error {
	deployRevStr, ok := deployment.Annotations[revisionAnnotation]
	if !ok {
		return fmt.Errorf("no revision in the %s deployment: %w", deployment.GetName(), ErrRevisionAnnotationNotFound)
	}

	deployRev, err := strconv.Atoi(deployRevStr)
	if err != nil {
		return fmt.Errorf("can't parse %s deployment revision: %w", deployment.GetName(), err)
	}

	replicaSets, err := o.client.AppsV1().ReplicaSets(o.namespace).List(ctx, metav1.ListOptions{LabelSelector: appLabel})
	if err != nil {
		return fmt.Errorf("can't fetch %s deployment's replicasets: %w", deployment.GetName(), err)
	}

	rolledBack := false

	for _, replicaSet := range replicaSets.Items {
		rsRevStr, ok := replicaSet.Annotations[revisionAnnotation]
		if !ok {
			return fmt.Errorf("no revision in the %s replicaset: %w", replicaSet.GetName(), ErrRevisionAnnotationNotFound)
		}

		rsRev, err := strconv.Atoi(rsRevStr)
		if err != nil {
			return fmt.Errorf("can't parse %s replicaset revision: %w", replicaSet.GetName(), err)
		}

		if rsRev == deployRev-1 {
			o.logger.Infow("Rolling back to the previous replicaset", "replicaset", replicaSet.Name)
			deployment.Spec.Template = replicaSet.Spec.Template
			rolledBack = true

			break
		}
	}

	if !rolledBack {
		return fmt.Errorf("replicaset with revision %d not found: %w", deployRev-1, ErrNoPreviousReplicaSet)
	}

	o.logger.Infof("Successfully rolled back the %s deployment", deployment.GetName())

	return nil
}
