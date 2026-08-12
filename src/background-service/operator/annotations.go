package operator

import appsv1 "k8s.io/api/apps/v1"

type StateAction int

const (
	Synchronized StateAction = iota
	ShouldApply
	ShouldRollback
)

type annotationValue string

const (
	annotationPrefix   string          = "problem-operator/"
	annotationValueOn  annotationValue = "on"
	annotationValueOff annotationValue = "off"
)

func (lv annotationValue) Bool() bool {
	return lv == annotationValueOn
}

func getObjectState(enabled bool, deployment *appsv1.Deployment) StateAction {
	state := getFlagAnnotation(deployment).Bool()

	if enabled == state {
		return Synchronized
	}
	if enabled {
		return ShouldApply
	}
	return ShouldRollback
}

func setFlagAnnotation(deployment *appsv1.Deployment, lv annotationValue) {
	getAllAnnotations(deployment)[getAnnotationName()] = string(lv)
}

func getFlagAnnotation(deployment *appsv1.Deployment) annotationValue {
	labelName := getAnnotationName()

	strValue, ok := getAllAnnotations(deployment)[labelName]
	if ok && strValue == string(annotationValueOn) {
		return annotationValueOn
	}

	if !ok {
		setFlagAnnotation(deployment, annotationValueOff)
	}

	return annotationValueOff
}

func getAnnotationName() string {
	return annotationPrefix + flagName
}

func getAllAnnotations(deployment *appsv1.Deployment) map[string]string {
	if a := deployment.GetAnnotations(); a == nil {
		deployment.SetAnnotations(make(map[string]string))
	}

	return deployment.GetAnnotations()
}
