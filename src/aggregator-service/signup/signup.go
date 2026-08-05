package signup

import "dynatrace.com/easytrade/aggregator-service/offer"

type SignupRequest struct {
	PackageId offer.Package `json:"packageId"`
	FirstName string        `json:"firstName"`
	LastName  string        `json:"lastName"`
	Username  string        `json:"username"`
	Email     string        `json:"email"`
	Address   string        `json:"address"`
	Password  string        `json:"password"`
	Origin    string        `json:"origin"`
}
