package login

import (
	"errors"
	"gorm.io/gorm"
	db "dynatrace.com/easytrade/user-service/services"
	
)

func SignupUser(user SignupRequest) (int, error) {
	var existing Account
	result := db.DB.Where("Username = ? OR Email = ?", user.Username, user.Email).First(&existing)
	if result.Error == nil {
		return 0, errors.New("user already exists")
	}
	if !errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return 0, result.Error
	}

	account := user.ToAccount()
	if err := db.DB.Create(&account).Error; err != nil {
		return 0, err
	}

	balance := Balance{AccountId: account.Id, Value: 0}
	if err := db.DB.Create(&balance).Error; err != nil {
		return 0, err
	}

	return account.Id, nil
}
