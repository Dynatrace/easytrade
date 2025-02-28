package operator

import (
	"context"
	"errors"
	"testing"

	"go.uber.org/zap"
	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/kubernetes/fake"
)

func getTestLogger() *zap.SugaredLogger {
	return zap.Must(zap.NewDevelopment()).Sugar()
}

func getTestOperator(flagService FlagService) *Operator {
	return Config{
		Logger:      getTestLogger(),
		Client:      fake.NewClientset(),
		FlagService: flagService,
		Namespace:   "test",
	}.Build()
}

func TestAnnotations_SetGetAnnotation(t *testing.T) {
	t.Parallel()

	tests := []struct {
		object     Object
		annotation annotationValue
	}{
		{object: &appsv1.Deployment{ObjectMeta: metav1.ObjectMeta{Name: "test-deployment"}}, annotation: annotationValueOn},
		{object: &appsv1.ReplicaSet{ObjectMeta: metav1.ObjectMeta{Name: "test-replicaset"}}, annotation: annotationValueOff},
		{object: &corev1.Service{ObjectMeta: metav1.ObjectMeta{Name: "test-service"}}, annotation: annotationValueOn},
		{object: &corev1.Pod{ObjectMeta: metav1.ObjectMeta{Name: "test-pod"}}, annotation: annotationValueOff},
	}

	for _, test := range tests {
		flag := &Flag{ID: "test"}
		setFlagAnnotation(flag, test.object, test.annotation)

		annotation := getFlagAnnotation(flag, test.object)
		if annotation != test.annotation {
			t.Errorf("Expected \"%s\" annotation, got \"%s\"", test.annotation, annotation)
		}
	}
}

func TestOperator_CheckAutomatedAnnotations(t *testing.T) {
	t.Parallel()

	tests := []struct {
		object Object
	}{
		{object: &appsv1.Deployment{ObjectMeta: metav1.ObjectMeta{Name: "test-deployment"}}},
		{object: &appsv1.ReplicaSet{ObjectMeta: metav1.ObjectMeta{Name: "test-replicaset"}}},
		{object: &corev1.Service{ObjectMeta: metav1.ObjectMeta{Name: "test-service"}}},
		{object: &corev1.Pod{ObjectMeta: metav1.ObjectMeta{Name: "test-pod"}}},
	}

	for _, test := range tests {
		flag := &Flag{ID: "test", Enabled: false}
		flagService := &fakeFlagConnector{}
		flagService.addFlag(flag)

		operator := getTestOperator(flagService)
		operator.RegisterController(&testController{flagName: flag.ID, resource: test.object})

		if err := operator.updateState(context.Background()); err != nil {
			t.Errorf("Unexpected error returned (%s)", err)
		}

		annotations := test.object.GetAnnotations()
		annotationName := getAnnotationName(flag)

		valueOff := annotations[annotationName]
		flag.Enabled = true

		if err := operator.updateState(context.Background()); err != nil {
			t.Errorf("Unexpected error returned (%s)", err)
		}

		valueOn := annotations[annotationName]

		if valueOff != string(annotationValueOff) {
			t.Errorf("Expected \"%s\" annotation value with disabled flag, got \"%s\"", annotationValueOff, valueOff)
		}

		if valueOn != string(annotationValueOn) {
			t.Errorf("Expected \"%s\" annotation value with enabled flag, got \"%s\"", annotationValueOn, valueOn)
		}
	}
}

func TestOperator_ApplyRollbackUpdateChanges_Valid(t *testing.T) {
	t.Parallel()

	tests := []struct {
		object        Object
		initFlagState bool
		newFlagState  bool

		expectedApplies, expectedRollbacks, expectedUpdates int
	}{
		{
			object:        &appsv1.Deployment{ObjectMeta: metav1.ObjectMeta{Name: "test-deployment"}},
			initFlagState: false, newFlagState: false, expectedApplies: 0, expectedRollbacks: 0, expectedUpdates: 0,
		},
		{
			object:        &appsv1.ReplicaSet{ObjectMeta: metav1.ObjectMeta{Name: "test-replicaset"}},
			initFlagState: false, newFlagState: true, expectedApplies: 1, expectedRollbacks: 0, expectedUpdates: 1,
		},
		{
			object:        &corev1.Service{ObjectMeta: metav1.ObjectMeta{Name: "test-service"}},
			initFlagState: true, newFlagState: false, expectedApplies: 0, expectedRollbacks: 1, expectedUpdates: 1,
		},
		{
			object:        &corev1.Pod{ObjectMeta: metav1.ObjectMeta{Name: "test-pod"}},
			initFlagState: true, newFlagState: true, expectedApplies: 0, expectedRollbacks: 0, expectedUpdates: 0,
		},
	}

	for _, test := range tests {
		flag := &Flag{ID: "test", Enabled: test.initFlagState}
		flagService := &fakeFlagConnector{}
		flagService.addFlag(flag)

		annotationValue := annotationValueOff
		if test.initFlagState {
			annotationValue = annotationValueOn
		}

		setFlagAnnotation(flag, test.object, annotationValue)

		operator := getTestOperator(flagService)
		controller := &testController{flagName: flag.ID, resource: test.object}
		operator.RegisterController(controller)

		flag.Enabled = test.newFlagState

		if err := operator.updateState(context.Background()); err != nil {
			t.Errorf("Unexpected error returned (%s)", err)
		}

		if controller.applyCalls != test.expectedApplies {
			t.Errorf("Expected %d ApplyChange calls, got %d", test.expectedApplies, controller.applyCalls)
		}
	}
}

func TestOperator_ApplyRollbackUpdateChanges_ErrorInFlagService(t *testing.T) {
	t.Parallel()

	errFakeFlagService := errors.New("fake flag service error")
	tests := []struct {
		object Object
		err    error
	}{
		{object: &appsv1.Deployment{ObjectMeta: metav1.ObjectMeta{Name: "test-deployment"}}, err: errFakeFlagService},
		{object: &appsv1.ReplicaSet{ObjectMeta: metav1.ObjectMeta{Name: "test-replicaset"}}, err: errFakeFlagService},
		{object: &corev1.Service{ObjectMeta: metav1.ObjectMeta{Name: "test-service"}}, err: errFakeFlagService},
		{object: &corev1.Pod{ObjectMeta: metav1.ObjectMeta{Name: "test-pod"}}, err: errFakeFlagService},
	}

	for _, test := range tests {
		flag := &Flag{ID: "test"}
		flagService := &fakeFlagConnector{err: test.err}
		flagService.addFlag(flag)

		operator := getTestOperator(flagService)
		operator.RegisterController(&testController{flagName: flag.ID, resource: test.object})

		if err := operator.updateState(context.Background()); !errors.Is(err, test.err) {
			t.Errorf("Unexpected error returned \"%s\", expected \"%s\"", err, test.err)
		}
	}
}

func TestOperator_ApplyRollbackUpdateChanges_ErrorInController(t *testing.T) {
	t.Parallel()

	errFakeController := errors.New("fake controller error")
	tests := []struct {
		object Object
		err    error
	}{
		{object: &appsv1.Deployment{ObjectMeta: metav1.ObjectMeta{Name: "test-deployment"}}, err: errFakeController},
		{object: &appsv1.ReplicaSet{ObjectMeta: metav1.ObjectMeta{Name: "test-replicaset"}}, err: errFakeController},
		{object: &corev1.Service{ObjectMeta: metav1.ObjectMeta{Name: "test-service"}}, err: errFakeController},
		{object: &corev1.Pod{ObjectMeta: metav1.ObjectMeta{Name: "test-pod"}}, err: errFakeController},
	}

	for _, test := range tests {
		flag := &Flag{ID: "test"}
		flagService := &fakeFlagConnector{}
		flagService.addFlag(flag)

		operator := getTestOperator(flagService)
		operator.RegisterController(&testController{flagName: flag.ID, resource: test.object, err: test.err})

		if err := operator.updateState(context.Background()); !errors.Is(err, test.err) {
			t.Errorf("Unexpected error returned \"%s\", expected \"%s\"", err, test.err)
		}
	}
}

func TestOperator_ApplyRollbackUpdateChanges_ContextTimeout(t *testing.T) {
	t.Parallel()

	tests := []struct {
		object Object
	}{
		{object: &appsv1.Deployment{ObjectMeta: metav1.ObjectMeta{Name: "test-deployment"}}},
		{object: &appsv1.ReplicaSet{ObjectMeta: metav1.ObjectMeta{Name: "test-replicaset"}}},
		{object: &corev1.Service{ObjectMeta: metav1.ObjectMeta{Name: "test-service"}}},
		{object: &corev1.Pod{ObjectMeta: metav1.ObjectMeta{Name: "test-pod"}}},
	}

	for _, test := range tests {
		flag := &Flag{ID: "test"}
		flagService := &fakeFlagConnector{}
		flagService.addFlag(flag)

		operator := getTestOperator(flagService)
		operator.RegisterController(&testController{flagName: flag.ID, resource: test.object})

		ctx, cancel := context.WithTimeout(context.Background(), 0)
		defer cancel()

		if err := operator.updateState(ctx); !errors.Is(err, context.DeadlineExceeded) {
			t.Errorf("Unexpected error returned \"%s\", expected \"%s\"", err, context.DeadlineExceeded)
		}
	}
}

type fakeFlagConnector struct {
	flags map[string]*Flag
	err   error
}

func (c *fakeFlagConnector) GetFlag(_ context.Context, flagName string) (*Flag, error) {
	if c.err != nil {
		return nil, c.err
	}

	flag := c.flags[flagName]

	return flag, nil
}

func (c *fakeFlagConnector) addFlag(flag *Flag) {
	if c.flags == nil {
		c.flags = make(map[string]*Flag)
	}

	c.flags[flag.ID] = flag
}

type testController struct {
	flagName string
	resource Object
	err      error

	applyCalls, rollbackCalls, updateCalls, getCalls, nameCalls int
}

func (c *testController) ApplyChange(_ context.Context, _ string, _ kubernetes.Interface, _ Object) error {
	c.applyCalls++

	return c.err
}

func (c *testController) RollbackChange(_ context.Context, _ string, _ kubernetes.Interface, _ Object) error {
	c.rollbackCalls++

	return c.err
}

func (c *testController) UpdateResource(_ context.Context, _ string, _ kubernetes.Interface, _ Object) error {
	c.updateCalls++

	return c.err
}

func (c *testController) GetResource(_ context.Context, _ string, _ kubernetes.Interface) (Object, error) {
	c.getCalls++
	if c.err != nil {
		return nil, c.err
	}

	return c.resource, nil
}

func (c *testController) GetFlagName() string {
	c.nameCalls++

	return c.flagName
}
