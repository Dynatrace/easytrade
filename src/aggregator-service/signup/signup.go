package signup

import "dynatrace.com/easytrade/aggregator-service/offer"

type SignupRequest struct {
	PackageId      offer.Package
	FirstName      string
	LastName       string
	Username       string
	Email          string
	Address        string
	HashedPassword string
	Origin         string
}
