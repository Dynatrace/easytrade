package login

import (
	db "dynatrace.com/easytrade/user-service/services"
	"errors"
	"gorm.io/gorm"
)

func LoginUser(username, password string) (int, error) {
	var account Account
	result := db.DB.Where("Username = ?", username).First(&account)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return 0, errors.New("user not found")
		}
		return 0, result.Error
	}

	hashString := HashPassword(password)

	if account.HashedPassword != hashString {
		return 0, errors.New("invalid password")
	}

	return account.Id, nil
}

func SignupUser(user SignupRequest) (int, error) {
	var id int
	err := db.DB.Transaction(func(tx *gorm.DB) error {
		var existing Account
		result := tx.Where("Username = ? OR Email = ?", user.Username, user.Email).First(&existing)
		if result.Error == nil {
			return errors.New("user already exists")
		}
		if !errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return result.Error
		}

		account := user.ToAccount()
		if err := tx.Create(&account).Error; err != nil {
			return err
		}
		id = account.Id

		balance := Balance{AccountId: account.Id, Value: 0}
		return tx.Create(&balance).Error
	})
	if err != nil {
		return 0, err
	}

	return id, nil
}
