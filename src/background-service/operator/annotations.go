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

func getObjectState(flag *Flag, deployment *appsv1.Deployment) StateAction {
	flagState := flag.Enabled
	state := getFlagAnnotation(flag, deployment).Bool()

	if flagState == state {
		return Synchronized
	}
	if flagState {
		return ShouldApply
	}
	return ShouldRollback
}

func setFlagAnnotation(flag *Flag, deployment *appsv1.Deployment, lv annotationValue) {
	getAllAnnotations(deployment)[getAnnotationName(flag)] = string(lv)
}

func getFlagAnnotation(flag *Flag, deployment *appsv1.Deployment) annotationValue {
	labelName := getAnnotationName(flag)

	strValue, ok := getAllAnnotations(deployment)[labelName]
	if ok && strValue == string(annotationValueOn) {
		return annotationValueOn
	}

	if !ok {
		setFlagAnnotation(flag, deployment, annotationValueOff)
	}

	return annotationValueOff
}

func getAnnotationName(flag *Flag) string {
	return annotationPrefix + flag.ID
}

func getAllAnnotations(deployment *appsv1.Deployment) map[string]string {
	if a := deployment.GetAnnotations(); a == nil {
		deployment.SetAnnotations(make(map[string]string))
	}

	return deployment.GetAnnotations()
}
