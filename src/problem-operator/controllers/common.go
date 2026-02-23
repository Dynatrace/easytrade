package controllers

import (
	"context"
	"errors"
	"fmt"
	"strconv"

	"go.uber.org/zap"
	appsv1 "k8s.io/api/apps/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

const (
	revisionAnnotation = "deployment.kubernetes.io/revision"
	appLabelPrefix     = "app="
)

var (
	ErrRevisionAnnotationNotFound = fmt.Errorf("revision annotation %s not found", revisionAnnotation)
	ErrNoPreviousReplicaSet       = errors.New("no previous replicaset found")
	ErrObjectCast                 = errors.New("can't cast object to the expected resource")
)

// Roll back the deployment pod template from previous replicaset.
func RollbackDeployment(
	ctx context.Context,
	logger *zap.SugaredLogger,
	namespace string,
	client kubernetes.Interface,
	deployment *appsv1.Deployment,
) error {
	logger.Infow("Starting deployment rollback", "namespace", namespace, "deployment", deployment.GetName())

	deployRevStr, ok := deployment.Annotations[revisionAnnotation]
	if !ok {
		logger.Errorw("Deployment revision annotation not found", "namespace", namespace, "deployment", deployment.GetName(), "annotation", revisionAnnotation, "annotations", deployment.Annotations)
		return fmt.Errorf("no revision in the %s deployment: %w", deployment.GetName(), ErrRevisionAnnotationNotFound)
	}

	logger.Infow("Found deployment revision annotation", "namespace", namespace, "deployment", deployment.GetName(), "revision", deployRevStr)

	deployRev, err := strconv.Atoi(deployRevStr)
	if err != nil {
		logger.Errorw("Failed to parse deployment revision", "namespace", namespace, "deployment", deployment.GetName(), "revision", deployRevStr, "error", err)
		return fmt.Errorf("can't parse %s deployment revision: %w", deployment.GetName(), err)
	}

	logger.Infow("Parsed deployment revision", "namespace", namespace, "deployment", deployment.GetName(), "revision", deployRev, "targetPreviousRevision", deployRev-1)

	replicaSetClient := client.AppsV1().ReplicaSets(namespace)
	selector := appLabelPrefix + deployment.Name
	deploymentSelector := "<nil>"
	deploymentSelectorMatchLabels := map[string]string{}
	deploymentSelectorMatchExpressions := []metav1.LabelSelectorRequirement{}
	if deployment.Spec.Selector != nil {
		deploymentSelector = metav1.FormatLabelSelector(deployment.Spec.Selector)
		deploymentSelectorMatchLabels = deployment.Spec.Selector.MatchLabels
		deploymentSelectorMatchExpressions = deployment.Spec.Selector.MatchExpressions
	}
	logger.Infow(
		"Rollback selector comparison",
		"namespace", namespace,
		"deployment", deployment.GetName(),
		"currentReplicaSetSelector", selector,
		"deploymentSelector", deploymentSelector,
		"deploymentSelectorMatchLabels", deploymentSelectorMatchLabels,
		"deploymentSelectorMatchExpressions", deploymentSelectorMatchExpressions,
	)
	logger.Infow("Listing ReplicaSets for rollback", "namespace", namespace, "deployment", deployment.GetName(), "labelSelector", selector)

	replicaSets, err := replicaSetClient.List(ctx, metav1.ListOptions{LabelSelector: selector})
	if err != nil {
		logger.Errorw("Failed to list ReplicaSets", "namespace", namespace, "deployment", deployment.GetName(), "labelSelector", selector, "error", err)
		return fmt.Errorf("can't fetch %s deployment's replicasets: %w", deployment.GetName(), err)
	}

	logger.Infow("ReplicaSets listed", "namespace", namespace, "deployment", deployment.GetName(), "count", len(replicaSets.Items), "targetPreviousRevision", deployRev-1)

	rolledBack := false

	for _, replicaSet := range replicaSets.Items {
		logger.Infow("Inspecting ReplicaSet for rollback", "namespace", namespace, "deployment", deployment.GetName(), "replicaset", replicaSet.GetName(), "annotations", replicaSet.Annotations, "labels", replicaSet.Labels)

		rsRevStr, ok := replicaSet.Annotations[revisionAnnotation]
		if !ok {
			logger.Errorw("ReplicaSet revision annotation not found", "namespace", namespace, "deployment", deployment.GetName(), "replicaset", replicaSet.GetName(), "annotation", revisionAnnotation, "annotations", replicaSet.Annotations)
			return fmt.Errorf("no revision in the %s replicaset: %w", replicaSet.GetName(), ErrRevisionAnnotationNotFound)
		}

		rsRev, err := strconv.Atoi(rsRevStr)
		if err != nil {
			logger.Errorw("Failed to parse ReplicaSet revision", "namespace", namespace, "deployment", deployment.GetName(), "replicaset", replicaSet.GetName(), "revision", rsRevStr, "error", err)
			return fmt.Errorf("can't parse %s replicaset revision: %w", replicaSet.GetName(), err)
		}

		logger.Infow("ReplicaSet revision parsed", "namespace", namespace, "deployment", deployment.GetName(), "replicaset", replicaSet.GetName(), "replicaSetRevision", rsRev, "targetPreviousRevision", deployRev-1)

		if rsRev == deployRev-1 {
			logger.Infow("Rolling back to the previous replicaset", "replicaset", replicaSet.Name)
			deployment.Spec.Template = replicaSet.Spec.Template
			rolledBack = true

			break
		}
	}

	if !rolledBack {
		logger.Errorw("No previous ReplicaSet found for rollback", "namespace", namespace, "deployment", deployment.GetName(), "targetPreviousRevision", deployRev-1, "listedReplicaSets", len(replicaSets.Items), "labelSelector", selector)
		return fmt.Errorf("replicaset with revision %d not found: %w", deployRev-1, ErrNoPreviousReplicaSet)
	}

	logger.Infow("Deployment rollback preparation completed", "namespace", namespace, "deployment", deployment.GetName(), "rolledBack", rolledBack, "targetPreviousRevision", deployRev-1)

	return nil
}
