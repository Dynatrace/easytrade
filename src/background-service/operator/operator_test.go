package operator

import (
	"context"
	"errors"
	"testing"

	"go.uber.org/zap"
	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/kubernetes/fake"

	"dynatrace.com/easytrade/background-service/featureflag"
)

const testNamespace = "test"

func getTestLogger() *zap.SugaredLogger {
	return zap.Must(zap.NewDevelopment()).Sugar()
}

func getTestOperator(flagService featureflag.FlagService, client kubernetes.Interface) *Operator {
	return Config{
		Logger:      getTestLogger(),
		Client:      client,
		FlagService: flagService,
		Namespace:   testNamespace,
	}.Build()
}

func newTestDeployment(annotations map[string]string, cpuLimit string) *appsv1.Deployment {
	limits := corev1.ResourceList{}
	if cpuLimit != "" {
		limits[corev1.ResourceCPU] = resource.MustParse(cpuLimit)
	}

	return &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:        brokerService,
			Namespace:   testNamespace,
			Annotations: annotations,
		},
		Spec: appsv1.DeploymentSpec{
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{Name: "broker-service", Resources: corev1.ResourceRequirements{Limits: limits}},
					},
				},
			},
		},
	}
}

func newTestReplicaSet(revision string, cpuLimit string) *appsv1.ReplicaSet {
	limits := corev1.ResourceList{}
	if cpuLimit != "" {
		limits[corev1.ResourceCPU] = resource.MustParse(cpuLimit)
	}

	return &appsv1.ReplicaSet{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "broker-service-" + revision,
			Namespace: testNamespace,
			Labels:    map[string]string{"app.kubernetes.io/name": "broker-service"},
			Annotations: map[string]string{
				revisionAnnotation: revision,
			},
		},
		Spec: appsv1.ReplicaSetSpec{
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{Name: "broker-service", Resources: corev1.ResourceRequirements{Limits: limits}},
					},
				},
			},
		},
	}
}

func getDeployment(t *testing.T, client kubernetes.Interface) *appsv1.Deployment {
	t.Helper()

	deployment, err := client.AppsV1().Deployments(testNamespace).Get(context.Background(), brokerService, metav1.GetOptions{})
	if err != nil {
		t.Fatalf("failed to fetch the test deployment: %s", err)
	}

	return deployment
}

func TestAnnotations_SetGetAnnotation(t *testing.T) {
	t.Parallel()

	deployment := newTestDeployment(nil, "")

	setFlagAnnotation(deployment, annotationValueOn)

	if annotation := getFlagAnnotation(deployment); annotation != annotationValueOn {
		t.Errorf("Expected %q annotation, got %q", annotationValueOn, annotation)
	}

	setFlagAnnotation(deployment, annotationValueOff)

	if annotation := getFlagAnnotation(deployment); annotation != annotationValueOff {
		t.Errorf("Expected %q annotation, got %q", annotationValueOff, annotation)
	}
}

func TestOperator_UpdateState_AppliesChangeWhenFlagEnabled(t *testing.T) {
	t.Parallel()

	client := fake.NewClientset(newTestDeployment(nil, ""))

	flagService := &fakeFlagConnector{enabled: true}

	op := getTestOperator(flagService, client)

	if err := op.updateState(context.Background()); err != nil {
		t.Fatalf("Unexpected error returned (%s)", err)
	}

	deployment := getDeployment(t, client)

	limit := deployment.Spec.Template.Spec.Containers[0].Resources.Limits[corev1.ResourceCPU]
	if limit.String() != cpuLimitDefault {
		t.Errorf("Expected cpu limit %q, got %q", cpuLimitDefault, limit.String())
	}

	annotationName := "problem-operator/" + flagName
	if got := deployment.Annotations[annotationName]; got != string(annotationValueOn) {
		t.Errorf("Expected annotation %q, got %q", annotationValueOn, got)
	}
}

func TestOperator_UpdateState_RollsBackChangeWhenFlagDisabled(t *testing.T) {
	t.Parallel()

	annotationName := "problem-operator/" + flagName
	deployment := newTestDeployment(map[string]string{
		annotationName:     string(annotationValueOn),
		revisionAnnotation: "2",
	}, cpuLimitDefault)
	previousReplicaSet := newTestReplicaSet("1", "")

	client := fake.NewClientset(deployment, previousReplicaSet)

	flagService := &fakeFlagConnector{enabled: false}

	op := getTestOperator(flagService, client)

	if err := op.updateState(context.Background()); err != nil {
		t.Fatalf("Unexpected error returned (%s)", err)
	}

	updated := getDeployment(t, client)

	if _, hasLimit := updated.Spec.Template.Spec.Containers[0].Resources.Limits[corev1.ResourceCPU]; hasLimit {
		t.Errorf("Expected the cpu limit to be rolled back, but it's still set")
	}

	if got := updated.Annotations[annotationName]; got != string(annotationValueOff) {
		t.Errorf("Expected annotation %q, got %q", annotationValueOff, got)
	}
}

func TestOperator_UpdateState_NoopWhenSynchronized(t *testing.T) {
	t.Parallel()

	annotationName := "problem-operator/" + flagName
	client := fake.NewClientset(newTestDeployment(map[string]string{annotationName: string(annotationValueOff)}, ""))

	flagService := &fakeFlagConnector{enabled: false}

	op := getTestOperator(flagService, client)

	if err := op.updateState(context.Background()); err != nil {
		t.Fatalf("Unexpected error returned (%s)", err)
	}

	deployment := getDeployment(t, client)

	if _, hasLimit := deployment.Spec.Template.Spec.Containers[0].Resources.Limits[corev1.ResourceCPU]; hasLimit {
		t.Errorf("Expected no cpu limit to be set")
	}

	if got := deployment.Annotations[annotationName]; got != string(annotationValueOff) {
		t.Errorf("Expected annotation to remain %q, got %q", annotationValueOff, got)
	}
}

func TestOperator_UpdateState_ErrorFromFlagService(t *testing.T) {
	t.Parallel()

	errFakeFlagService := errors.New("fake flag service error")
	client := fake.NewClientset(newTestDeployment(nil, ""))

	flagService := &fakeFlagConnector{err: errFakeFlagService}

	op := getTestOperator(flagService, client)

	if err := op.updateState(context.Background()); !errors.Is(err, errFakeFlagService) {
		t.Errorf("Unexpected error returned %q, expected %q", err, errFakeFlagService)
	}
}

func TestOperator_UpdateState_ErrorWhenDeploymentMissing(t *testing.T) {
	t.Parallel()

	client := fake.NewClientset()

	flagService := &fakeFlagConnector{enabled: true}

	op := getTestOperator(flagService, client)

	if err := op.updateState(context.Background()); err == nil {
		t.Error("Expected an error when the deployment doesn't exist, got nil")
	}
}

func TestOperator_UpdateState_ErrorWhenNoPreviousReplicaSet(t *testing.T) {
	t.Parallel()

	annotationName := "problem-operator/" + flagName
	deployment := newTestDeployment(map[string]string{
		annotationName:     string(annotationValueOn),
		revisionAnnotation: "1",
	}, cpuLimitDefault)

	client := fake.NewClientset(deployment)

	flagService := &fakeFlagConnector{enabled: false}

	op := getTestOperator(flagService, client)

	if err := op.updateState(context.Background()); !errors.Is(err, ErrNoPreviousReplicaSet) {
		t.Errorf("Unexpected error returned %q, expected %q", err, ErrNoPreviousReplicaSet)
	}
}

func TestOperator_UpdateState_ContextTimeout(t *testing.T) {
	t.Parallel()

	client := fake.NewClientset(newTestDeployment(nil, ""))

	flagService := &fakeFlagConnector{}

	op := getTestOperator(flagService, client)

	ctx, cancel := context.WithTimeout(context.Background(), 0)
	defer cancel()

	if err := op.updateState(ctx); !errors.Is(err, context.DeadlineExceeded) {
		t.Errorf("Unexpected error returned %q, expected %q", err, context.DeadlineExceeded)
	}
}

type fakeFlagConnector struct {
	enabled bool
	err     error
}

func (c *fakeFlagConnector) GetBool(_ context.Context, _ string, _ bool) (bool, error) {
	if c.err != nil {
		return false, c.err
	}

	return c.enabled, nil
}
