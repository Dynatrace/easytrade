package account

import (
	"strconv"
	"time"

	"dynatrace.com/easytrade/user-service/dbadapter/proto"
	"google.golang.org/protobuf/types/known/timestamppb"
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
func (sr *SignupRequest) ToCreateAccountRequest() *proto.CreateAccountRequest {
	now := timestamppb.New(time.Now())
	return &proto.CreateAccountRequest{
		PackageId:             strconv.Itoa(sr.PackageId),
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
	Id string `json:"id"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

type ShortAccount struct {
	Id        string `json:"id"`
	Username  string `json:"username"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
}

type AccountsContainer struct {
	Results []ShortAccount `json:"results"`
}

// AccountResponse is the account view returned by GET /api/accounts/:id. It re-shapes
// proto.AccountMessage's snake_case wire format into the API's camelCase JSON contract and
// deliberately omits HashedPassword.
type AccountResponse struct {
	Id                    string    `json:"id"`
	PackageId             string    `json:"packageId"`
	FirstName             string    `json:"firstName"`
	LastName              string    `json:"lastName"`
	Username              string    `json:"username"`
	Email                 string    `json:"email"`
	Origin                string    `json:"origin"`
	CreationDate          time.Time `json:"creationDate"`
	PackageActivationDate time.Time `json:"packageActivationDate"`
	AccountActive         bool      `json:"accountActive"`
	Address               string    `json:"address"`
}

func toAccountResponse(a *proto.AccountMessage) AccountResponse {
	return AccountResponse{
		Id:                    a.Id,
		PackageId:             a.PackageId,
		FirstName:             a.FirstName,
		LastName:              a.LastName,
		Username:              a.Username,
		Email:                 a.Email,
		Origin:                a.Origin,
		CreationDate:          a.GetCreationDate().AsTime(),
		PackageActivationDate: a.GetPackageActivationDate().AsTime(),
		AccountActive:         a.AccountActive,
		Address:               a.Address,
	}
}

func isPreset(a *proto.AccountMessage) bool {
	return a.Origin == "PRESET"
}

func toShortAccount(a *proto.AccountMessage) ShortAccount {
	return ShortAccount{
		Id:        a.Id,
		Username:  a.Username,
		FirstName: a.FirstName,
		LastName:  a.LastName,
	}
}

func filterPresets(accounts []*proto.AccountMessage) []ShortAccount {
	var presets []ShortAccount
	for _, acc := range accounts {
		if isPreset(acc) {
			presets = append(presets, toShortAccount(acc))
		}
	}
	return presets
}
