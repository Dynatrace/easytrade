package operator

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"dynatrace.com/easytrade/problem-operator/featureflag"
	"go.uber.org/zap"
	"golang.org/x/sync/errgroup"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/util/wait"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/kubernetes/scheme"
	typedcorev1 "k8s.io/client-go/kubernetes/typed/core/v1"
	"k8s.io/client-go/tools/record"
	"k8s.io/client-go/util/retry"
)

const timeoutIntervalMultiplier = 1.1

type (
	Operator struct {
		logger      *zap.SugaredLogger
		client      kubernetes.Interface
		flagService FlagService
		broadcaster record.EventBroadcaster
		recorder    record.EventRecorder
		controllers controllerSet
		namespace   string
		interval    time.Duration
	}
	controllerSet = map[string][]Controller

	FlagService interface {
		GetFlag(ctx context.Context, flagName string) (*Flag, error)
	}
	Flag = featureflag.FeatureFlag
)

func New(
	logger *zap.SugaredLogger,
	client kubernetes.Interface,
	flagService FlagService,
	namespace string,
	interval time.Duration,
) *Operator {
	eventBroadcaster := record.NewBroadcaster()
	eventBroadcaster.StartRecordingToSink(&typedcorev1.EventSinkImpl{Interface: client.CoreV1().Events("")})
	eventRecorder := eventBroadcaster.NewRecorder(scheme.Scheme, corev1.EventSource{Component: "problem-operator"})

	return &Operator{
		logger:      logger,
		flagService: flagService,
		client:      client,
		broadcaster: eventBroadcaster,
		recorder:    eventRecorder,
		controllers: make(controllerSet),
		namespace:   namespace,
		interval:    interval,
	}
}

func (o *Operator) Run(ctx context.Context) {
	o.logger.Infow("Starting the operator...", "interval", o.interval, "namespace", o.namespace)

	ticker := time.NewTicker(o.interval)
	defer ticker.Stop()

	for {
		<-ticker.C

		if err := o.updateState(ctx); err == nil {
			o.logger.Info("Successfully updated state")
		} else if wait.Interrupted(err) || strings.Contains(err.Error(), "context deadline") {
			o.interval = time.Duration(float64(o.interval) * timeoutIntervalMultiplier)
			ticker.Reset(o.interval)

			o.logger.Warnf("Context interrupted, changing the update interval to %s", o.interval)
		} else {
			o.logger.Errorf("An error occurred while updating the state (%s)", err)
		}
	}
}

func (o *Operator) Shutdown() {
	o.broadcaster.Shutdown()
}

func (o *Operator) RegisterController(c Controller) {
	current := o.getControllersForFlag(c.GetFlagName())
	o.setControllersForFlag(c.GetFlagName(), append(current, c))

	o.logger.Infof("Added \"%T\" controller for the \"%s\" flag", c, c.GetFlagName())
}

func (o *Operator) updateState(ctx context.Context) error {
	o.logger.Infow("Updating state...", "namespace", o.namespace)

	var aggregateErr error

	ctx, cancel := context.WithTimeout(ctx, o.interval)
	defer cancel()

	for flagName, controllers := range o.controllers {
		flag, err := o.flagService.GetFlag(ctx, flagName)
		if err != nil {
			o.logger.Errorf("An error occurred while fetching the \"%s\" flag - %s", flagName, err)
			aggregateErr = errors.Join(aggregateErr, err)

			continue
		}

		errs, ctx := errgroup.WithContext(ctx)
		for _, c := range controllers {
			errs.Go(func() error {
				return o.processController(ctx, flag, c)
			})
		}

		err = errs.Wait()
		if err != nil {
			o.logger.Errorf("An error occurred while updating state for the \"%s\" flag - %s", flag.ID, err)
			aggregateErr = errors.Join(aggregateErr, err)

			continue
		}
	}

	return aggregateErr
}

func (o *Operator) processController(ctx context.Context, flag *Flag, controller Controller) error {
	return retry.RetryOnConflict(retry.DefaultRetry, func() error {
		if err := ctx.Err(); err != nil {
			return fmt.Errorf("context cancelled while processing controller: %w", err)
		}

		obj, err := controller.GetResource(ctx, o.namespace, o.client)
		if err != nil {
			return fmt.Errorf("failed to fetch the resource for the \"%s\" flag: %w", flag.ID, err)
		}

		state := getObjectState(flag, obj)

		logger := o.logger.With(
			"flag", flag.ID,
			"enabled", flag.Enabled,
		)

		switch state {
		case ShouldApply:
			logger.Infof("Applying changes to the %s", obj.GetName())
			o.recordEvent(obj, "FlagApply", fmt.Sprintf("Applying changes from the \"%s\" flag", flag.ID))

			setFlagAnnotation(flag, obj, annotationValueOn)
			err = controller.ApplyChange(ctx, o.namespace, o.client, obj)

		case ShouldRollback:
			logger.Infof("Rolling back changes of the %s", obj.GetName())
			o.recordEvent(obj, "FlagRollback", fmt.Sprintf("Rolling back changes from the \"%s\" flag", flag.ID))

			setFlagAnnotation(flag, obj, annotationValueOff)
			err = controller.RollbackChange(ctx, o.namespace, o.client, obj)

		case Synchronized:
			logger.Infof("State of the %s is synchronized", obj.GetName())
		}

		if err != nil {
			return fmt.Errorf("failed to apply changes to the %s's state: %w", obj.GetName(), err)
		}

		err = controller.UpdateResource(ctx, o.namespace, o.client, obj)
		if err != nil {
			return fmt.Errorf("failed to update the %s resource: %w", obj.GetName(), err)
		}

		return nil
	})
}

func (o *Operator) getControllersForFlag(flag string) []Controller {
	if _, ok := o.controllers[flag]; !ok {
		o.controllers[flag] = make([]Controller, 0)
	}

	return o.controllers[flag]
}

func (o *Operator) setControllersForFlag(flag string, controllers []Controller) {
	o.controllers[flag] = controllers
}

func (o *Operator) recordEvent(obj Object, reason string, message string) {
	o.recorder.Event(obj, corev1.EventTypeNormal, reason, message)
}
