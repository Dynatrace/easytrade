package flag

import (
	"errors"
	"fmt"
)

type Flag struct {
	ID           string `json:"id"`
	Enabled      bool   `json:"enabled"`
	Name         string `json:"name"`
	Description  string `json:"description"`
	IsModifiable bool   `json:"isModifiable"`
	Tag          string `json:"tag"`
}

type FlagContainer struct {
	Results []*Flag `json:"results"`
}

type FlagUpdateRequest struct {
	Enabled *bool `json:"enabled"`
}

var ErrFlagNotFound = errors.New("flag not found")

type NonModifiableError struct{ Name string }

func (e *NonModifiableError) Error() string {
	return fmt.Sprintf("Can't update a non-modifiable flag [%s]", e.Name)
}
