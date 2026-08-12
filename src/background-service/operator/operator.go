package operator

import (
	"context"
	"strings"
	"time"

	"dynatrace.com/easytrade/background-service/featureflag"
	"go.uber.org/zap"
	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/util/wait"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/kubernetes/scheme"
	typedcorev1 "k8s.io/client-go/kubernetes/typed/core/v1"
	"k8s.io/client-go/tools/record"
)

const timeoutIntervalMultiplier = 1.1

type Operator struct {
	logger      *zap.SugaredLogger
	client      kubernetes.Interface
	flagService featureflag.FlagService
	broadcaster record.EventBroadcaster
	recorder    record.EventRecorder
	namespace   string
	interval    time.Duration
	cpuLimit    string
}

func New(
	logger *zap.SugaredLogger,
	client kubernetes.Interface,
	flagService featureflag.FlagService,
	namespace string,
	interval time.Duration,
	cpuLimit string,
) *Operator {
	eventBroadcaster := record.NewBroadcaster()
	eventBroadcaster.StartRecordingToSink(&typedcorev1.EventSinkImpl{Interface: client.CoreV1().Events("")})
	eventRecorder := eventBroadcaster.NewRecorder(scheme.Scheme, corev1.EventSource{Component: "background-service-operator"})

	return &Operator{
		logger:      logger,
		flagService: flagService,
		client:      client,
		broadcaster: eventBroadcaster,
		recorder:    eventRecorder,
		namespace:   namespace,
		interval:    interval,
		cpuLimit:    cpuLimit,
	}
}

func (o *Operator) Start(ctx context.Context) {
	go func() {
		o.logger.Infow("Starting the operator...", "interval", o.interval, "namespace", o.namespace)

		ticker := time.NewTicker(o.interval)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				err := o.updateState(ctx)
				if err == nil {
					o.logger.Info("Successfully updated state")
					continue
				}
				prev := o.interval
				if next := o.backoff(err, prev); next != prev {
					ticker.Reset(next)
				}
			case <-ctx.Done():
				return
			}
		}
	}()
}

func (o *Operator) backoff(err error, current time.Duration) time.Duration {
	if !wait.Interrupted(err) && !strings.Contains(err.Error(), "context deadline") {
		o.logger.Errorf("An error occurred while updating the state (%s)", err)
		return current
	}

	next := time.Duration(float64(current) * timeoutIntervalMultiplier)
	o.interval = next
	o.logger.Warnf("Context interrupted, changing the update interval to %s", next)
	return next
}

func (o *Operator) Shutdown() {
	o.broadcaster.Shutdown()
}

func (o *Operator) updateState(ctx context.Context) error {
	o.logger.Infow("Updating state...", "namespace", o.namespace)

	if err := ctx.Err(); err != nil {
		return err
	}

	ctx, cancel := context.WithTimeout(ctx, o.interval)
	defer cancel()

	enabled, err := o.flagService.GetBool(ctx, flagName, false)
	if err != nil {
		o.logger.Errorf("An error occurred while fetching the %q flag - %s", flagName, err)
		return err
	}

	if err := o.reconcile(ctx, enabled); err != nil {
		o.logger.Errorf("An error occurred while updating state for the %q flag - %s", flagName, err)
		return err
	}

	return nil
}

func (o *Operator) recordEvent(obj *appsv1.Deployment, reason, message string) {
	o.recorder.Event(obj, corev1.EventTypeNormal, reason, message)
}
