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
	deployRevStr, ok := deployment.Annotations[revisionAnnotation]
	if !ok {
		return fmt.Errorf("no revision in the %s deployment: %w", deployment.GetName(), ErrRevisionAnnotationNotFound)
	}

	deployRev, err := strconv.Atoi(deployRevStr)
	if err != nil {
		return fmt.Errorf("can't parse %s deployment revision: %w", deployment.GetName(), err)
	}

	replicaSetClient := client.AppsV1().ReplicaSets(namespace)

	replicaSets, err := replicaSetClient.List(ctx, metav1.ListOptions{LabelSelector: appLabelPrefix + deployment.Name})
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
			logger.Infow("Rolling back to the previous replicaset", "replicaset", replicaSet.Name)
			deployment.Spec.Template = replicaSet.Spec.Template
			rolledBack = true

			break
		}
	}

	if !rolledBack {
		return fmt.Errorf("replicaset with revision %d not found: %w", deployRev-1, ErrNoPreviousReplicaSet)
	}

	return nil
}
