package featureflag

type FeatureFlag struct {
	ID           string `json:"id"`
	Enabled      bool   `json:"enabled"`
	Name         string `json:"name"`
	Description  string `json:"description"`
	IsModifiable bool   `json:"isModifiable"`
	Tag          string `json:"tag"`
}

type featureFlagResults struct {
	Results []FeatureFlag `json:"results"`
}
