package main

import (
	"log"

	"canopiq/config"
	"canopiq/db"
	"canopiq/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.LoadSettings()

	if err := db.InitDatabase(cfg.DatabaseURL); err != nil {
		log.Fatalf("Database initialization failed: %v", err)
	}
	defer db.Close()

	router := gin.Default()

	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	router.Static("/uploads", cfg.StorageLocalPath)

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
			"env":    cfg.AppEnv,
		})
	})

	if err := routes.RegisterRoutes(router); err != nil {
		log.Fatalf("Failed to register routes: %v", err)
	}

	log.Printf("Starting server on :%s\n", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
