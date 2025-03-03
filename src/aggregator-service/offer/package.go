package offer

type Package int

const (
	StarterPackage Package = iota + 1
	LightPackage
	ProPackage
)

func (p Package) String() string {
	switch p {
	case StarterPackage:
		return "Starter"
	case LightPackage:
		return "Light"
	case ProPackage:
		return "Pro"
	default:
		return "Unknown"
	}
}
