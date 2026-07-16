package login

import "time"

// Account is the GORM model backing the shared "Accounts" table.
type Account struct {
	Id                    int `gorm:"primaryKey"`
	PackageId             int
	FirstName             string
	LastName              string
	Username              string
	Email                 string
	HashedPassword        string
	Origin                string
	CreationDate          time.Time
	PackageActivationDate time.Time
	AccountActive         bool
	Address               string
}

func (Account) TableName() string {
	return "Accounts"
}

// Balance is the GORM model backing the shared "Balance" table.
// AccountId is both the primary key and the (implicit) FK to Account.
type Balance struct {
	AccountId int     `gorm:"primaryKey"`
	Value     float64 `gorm:"type:decimal(18,8)"`
}

func (Balance) TableName() string {
	return "Balance"
}

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

func (sr *SignupRequest) ToAccount() *Account {
	return &Account{
		PackageId:             sr.PackageId,
		FirstName:             sr.FirstName,
		LastName:              sr.LastName,
		Username:              sr.Username,
		Email:                 sr.Email,
		HashedPassword:        HashPassword(sr.Password),
		Origin:                sr.Origin,
		CreationDate:          time.Now(),
		PackageActivationDate: time.Now(),
		AccountActive:         true,
		Address:               sr.Address,
	}
}

// IdResponse wraps a created/looked-up account id.
type IdResponse struct {
	Id int `json:"id"`
}

// MessageResponse wraps a human-readable success message.
type MessageResponse struct {
	Message string `json:"message"`
}

// ErrorResponse wraps a human-readable error message.
type ErrorResponse struct {
	Error string `json:"error"`
}
