package services

import (
	"fmt"
	"os"
	"time"

	"gorm.io/driver/sqlserver"
	"gorm.io/gorm"

	log "github.com/sirupsen/logrus"
)

var DB *gorm.DB

func connectLoop(credentials string, timeout time.Duration) (*gorm.DB, error) {
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	timeoutExceeded := time.After(timeout)
	for {
		select {
		case <-timeoutExceeded:
			return nil, fmt.Errorf("Error connecting to the database after %s timeout", timeout)
		case <-ticker.C:
			db, err := gorm.Open(sqlserver.Open(credentials), &gorm.Config{})

			if err == nil {
				return db, nil
			}

			log.Info("Connecting to the database...")
		}
	}
}

func ConnectToDB() {
	var dbConnError error
	dbCredentials := os.Getenv("MSSQL_CONNECTIONSTRING")

	DB, dbConnError = connectLoop(dbCredentials, time.Minute)

	if dbConnError != nil {
		log.Fatal(dbConnError)
	}

	log.Info("Connected to the database")
}
