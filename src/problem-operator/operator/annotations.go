package operator

type StateAction int

const (
	Synchronized StateAction = iota
	ShouldApply
	ShouldRollback
)

func (sa StateAction) String() string {
	switch sa {
	case Synchronized:
		return "Synchronized"
	case ShouldApply:
		return "ShouldApply"
	case ShouldRollback:
		return "ShouldRollback"
	default:
		return "UnknownState"
	}
}

type annotationValue string

const (
	annotationPrefix   string          = "problem-operator/"
	annotationValueOn  annotationValue = "on"
	annotationValueOff annotationValue = "off"
)

func (lv annotationValue) Bool() bool {
	return lv == annotationValueOn
}

func getObjectState(flag *Flag, obj Object) StateAction {
	flagState := flag.Enabled
	state := getFlagAnnotation(flag, obj).Bool()

	switch flagState {
	case state:
		return Synchronized
	case true:
		return ShouldApply
	default:
		return ShouldRollback
	}
}

func setFlagAnnotation(flag *Flag, obj Object, lv annotationValue) {
	getAllAnnotations(obj)[getAnnotationName(flag)] = string(lv)
}

func getFlagAnnotation(flag *Flag, obj Object) annotationValue {
	labelName := getAnnotationName(flag)

	strValue, ok := getAllAnnotations(obj)[labelName]
	if ok && strValue == string(annotationValueOn) {
		return annotationValueOn
	}

	if !ok { // add label if not found
		setFlagAnnotation(flag, obj, annotationValueOff)
	}

	return annotationValueOff
}

func getAnnotationName(flag *Flag) string {
	return annotationPrefix + flag.ID
}

func getAllAnnotations(obj Object) map[string]string {
	if a := obj.GetAnnotations(); a == nil { // add annotation map if doesn't exist
		obj.SetAnnotations(make(map[string]string))
	}

	return obj.GetAnnotations()
}
