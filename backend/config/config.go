package config

import (
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Settings struct {
	AppEnv           string
	SecretKey        string
	GeminiAPIKey     string
	DatabaseURL      string
	CorsOrigins      []string
	StorageBackend   string
	StorageLocalPath string
	Port             string
}

var Settings_Instance *Settings

func LoadSettings() *Settings {
	godotenv.Load()

	corsOrigins := []string{"http://localhost:5173"}
	if corsEnv := os.Getenv("CORS_ORIGINS"); corsEnv != "" {
		corsOrigins = strings.Split(corsEnv, ",")
	}

	s := &Settings{
		AppEnv:           getEnv("APP_ENV", "development"),
		SecretKey:        getEnv("SECRET_KEY", "change-me"),
		GeminiAPIKey:     getEnv("GEMINI_API_KEY", ""),
		DatabaseURL:      getEnv("DATABASE_URL", "postgresql://canopiq:password@localhost:5432/canopiq"),
		CorsOrigins:      corsOrigins,
		StorageBackend:   getEnv("STORAGE_BACKEND", "local"),
		StorageLocalPath: getEnv("STORAGE_LOCAL_PATH", "./uploads"),
		Port:             getEnv("PORT", "8000"),
	}

	Settings_Instance = s
	return s
}

func getEnv(key, defaultVal string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultVal
}
