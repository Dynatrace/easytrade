package datagenerator

import (
	"crypto/sha256"
	"encoding/hex"
	"math/rand"

	"dynatrace.com/easytrade/aggregator-service/config"
	"dynatrace.com/easytrade/aggregator-service/offer"
	"dynatrace.com/easytrade/aggregator-service/signup"
	"github.com/go-faker/faker/v4"
)

func CreateFakeSignupRequest(platformName string, packageProb *config.PackageProbability) *signup.SignupRequest {
	sr := &signup.SignupRequest{}

	sr.PackageId = getRandomPackage(packageProb)
	sr.FirstName = faker.FirstName()
	sr.LastName = faker.LastName()
	sr.Username = sr.FirstName + sr.LastName
	sr.Email = sr.Username + "@" + faker.DomainName()
	sr.Address = faker.GetRealAddress().Address
	sr.HashedPassword, _ = hashPassword(faker.Password())
	sr.Origin = platformName

	return sr
}

func getRandomPackage(packageProb *config.PackageProbability) offer.Package {
	elements := []offer.Package{offer.StarterPackage, offer.LightPackage, offer.ProPackage}
	probabilities := []float32{packageProb.Starter, packageProb.Light, packageProb.Pro}
	return getRandomValueWithProbability(elements, probabilities)
}

func getRandomValueWithProbability[T any](elements []T, probabilities []float32) T {
	var sum float32 = 0
	for _, p := range probabilities {
		sum += p
	}
	random := rand.Float32() * sum // normalization

	resultId := 0
	sum = 0
	for _, p := range probabilities {
		sum += p
		if sum >= random {
			break
		}
		resultId++
	}
	return elements[resultId]
}

func hashPassword(password string) (string, error) {
	h := sha256.New()
	_, err := h.Write([]byte(password))
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(h.Sum(nil)), nil
}
