package db

import (
	"fmt"
	"log"

	"canopiq/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Database struct {
	DB *gorm.DB
}

var DB_Instance *Database

func InitDatabase(databaseURL string) error {
	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	if err := db.AutoMigrate(&models.Plant{}, &models.DiaryEntry{}); err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	DB_Instance = &Database{DB: db}
	log.Println("Database initialized successfully")
	return nil
}

func GetDB() *gorm.DB {
	if DB_Instance == nil {
		log.Fatal("Database not initialized")
	}
	return DB_Instance.DB
}

func Close() error {
	if DB_Instance == nil {
		return nil
	}
	sqlDB, err := DB_Instance.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
