package operator

import (
	"context"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/client-go/kubernetes"
)

type Object interface {
	metav1.Object
	runtime.Object
}

type Controller interface {
	ApplyChange(ctx context.Context, namespace string, client kubernetes.Interface, obj Object) error
	RollbackChange(ctx context.Context, namespace string, clients kubernetes.Interface, obj Object) error
	UpdateResource(ctx context.Context, namespace string, client kubernetes.Interface, obj Object) error
	GetResource(ctx context.Context, namespace string, client kubernetes.Interface) (obj Object, err error)
	GetFlagName() string
}
