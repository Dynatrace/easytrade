package aggregator

import (
	"math/rand"

	"github.com/go-faker/faker/v4"
)

func createFakeSignupRequest(platformName string, packageProb *PackageProbability) *SignupRequest {
	sr := &SignupRequest{}

	sr.PackageId = packageIDs[randomPackage(packageProb)]
	sr.FirstName = faker.FirstName()
	sr.LastName = faker.LastName()
	sr.Username = sr.FirstName + sr.LastName
	sr.Email = sr.Username + "@" + faker.DomainName()
	sr.Address = faker.GetRealAddress().Address
	sr.Password = faker.Password()
	sr.Origin = platformName

	return sr
}

func randomPackage(packageProb *PackageProbability) Package {
	elements := []Package{StarterPackage, LightPackage, ProPackage}
	probabilities := []float32{packageProb.Starter, packageProb.Light, packageProb.Pro}
	return randomValueWithProbability(elements, probabilities)
}

func randomValueWithProbability[T any](elements []T, probabilities []float32) T {
	var sum float32
	for _, p := range probabilities {
		sum += p
	}
	target := rand.Float32() * sum // normalize

	resultID := 0
	sum = 0
	for _, p := range probabilities {
		sum += p
		if sum >= target {
			break
		}
		resultID++
	}
	return elements[resultID]
}
