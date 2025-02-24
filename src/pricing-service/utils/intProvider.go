package utils

import "math/rand"

type IntProvider interface {
	Intn(_ int) int
}

type RandomIntProvider struct{}

type FakeIntProvider struct{}

func (RandomIntProvider) Intn(i int) int {
	return rand.Intn(i)
}

func (FakeIntProvider) Intn(i int) int {
	return i
}
