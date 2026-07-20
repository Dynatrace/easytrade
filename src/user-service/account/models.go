package account

import (
	"time"

	"dynatrace.com/easytrade/user-service/dbadapter"
)

// LoginRequest is the payload accepted by POST /api/auth/login.
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// SignupRequest is the payload accepted by POST /api/auth/signup.
type SignupRequest struct {
	PackageId int    `json:"packageId" binding:"required"`
	FirstName string `json:"firstName" binding:"required"`
	LastName  string `json:"lastName" binding:"required"`
	Username  string `json:"username" binding:"required"`
	Email     string `json:"email" binding:"required"`
	Password  string `json:"password" binding:"required"`
	Origin    string `json:"origin" binding:"required"`
	Address   string `json:"address" binding:"required"`
}

// ToCreateAccountRequest maps the signup payload to a db-adapter CreateAccountRequest, hashing
// the password and stamping creation/activation dates.
func (sr *SignupRequest) ToCreateAccountRequest() dbadapter.CreateAccountRequest {
	now := time.Now()
	return dbadapter.CreateAccountRequest{
		PackageId:             sr.PackageId,
		FirstName:             sr.FirstName,
		LastName:              sr.LastName,
		Username:              sr.Username,
		Email:                 sr.Email,
		Password:              HashPassword(sr.Password),
		Origin:                sr.Origin,
		Address:               sr.Address,
		CreationDate:          now,
		PackageActivationDate: now,
		AccountActive:         true,
	}
}

type IdResponse struct {
	Id int `json:"id"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

type ShortAccount struct {
	Id        int    `json:"id"`
	Username  string `json:"username"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
}

type AccountsContainer struct {
	Results []ShortAccount `json:"results"`
}

func isPreset(a dbadapter.Account) bool {
	return a.Origin == "PRESET"
}

func toShortAccount(a dbadapter.Account) ShortAccount {
	return ShortAccount{
		Id:        a.Id,
		Username:  a.Username,
		FirstName: a.FirstName,
		LastName:  a.LastName,
	}
}

func filterPresets(accounts []dbadapter.Account) []ShortAccount {
	var presets []ShortAccount
	for _, acc := range accounts {
		if isPreset(acc) {
			presets = append(presets, toShortAccount(acc))
		}
	}
	return presets
}
