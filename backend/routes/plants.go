package routes

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"canopiq/config"
	"canopiq/db"
	"canopiq/models"
	"canopiq/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PlantHandler struct {
	plantService *services.PlantService
	aiService    *services.AIService
}

func NewPlantHandler(plantService *services.PlantService, aiService *services.AIService) *PlantHandler {
	return &PlantHandler{
		plantService: plantService,
		aiService:    aiService,
	}
}

func (h *PlantHandler) CreatePlant(c *gin.Context) {
	var req models.PlantCreateRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	plant, err := h.plantService.CreatePlant(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create plant"})
		return
	}

	c.JSON(http.StatusCreated, plant.ToResponse())
}

func (h *PlantHandler) ListPlants(c *gin.Context) {
	plants, err := h.plantService.ListPlants()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch plants"})
		return
	}

	responses := make([]models.PlantResponse, 0, len(plants))
	for _, p := range plants {
		responses = append(responses, p.ToResponse())
	}

	c.JSON(http.StatusOK, responses)
}

func (h *PlantHandler) GetPlant(c *gin.Context) {
	plantID := c.Param("plant_id")

	plant, err := h.plantService.GetPlant(plantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch plant"})
		return
	}

	if plant == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Plant not found"})
		return
	}

	c.JSON(http.StatusOK, plant.ToResponse())
}

func (h *PlantHandler) AnalyzePlant(c *gin.Context) {
	plantID := c.Param("plant_id")

	plant, err := h.plantService.GetPlant(plantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if plant == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Plant not found"})
		return
	}

	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Image file is required"})
		return
	}

	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read file"})
		return
	}
	defer src.Close()

	imageBytes := make([]byte, file.Size)
	if _, err := src.Read(imageBytes); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read file"})
		return
	}

	mediaType := file.Header.Get("Content-Type")
	if mediaType == "" {
		mediaType = "image/jpeg"
	}

	var imageURL *string
	if config.Settings_Instance.StorageBackend == "local" {
		os.MkdirAll(config.Settings_Instance.StorageLocalPath, os.ModePerm)
		filename := uuid.New().String() + ".jpg"
		filepath := filepath.Join(config.Settings_Instance.StorageLocalPath, filename)

		if err := os.WriteFile(filepath, imageBytes, 0644); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
			return
		}

		url := fmt.Sprintf("/uploads/%s", filename)
		imageURL = &url
	}

	analysis, err := h.aiService.AnalyzePlantImage(imageBytes, mediaType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("AI analysis failed: %v", err)})
		return
	}

	entry, err := h.plantService.AddDiaryEntry(plantID, *analysis, imageURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save diary entry"})
		return
	}

	c.JSON(http.StatusOK, entry.ToResponse())
}

func (h *PlantHandler) GetDiary(c *gin.Context) {
	plantID := c.Param("plant_id")

	entries, err := h.plantService.ListDiaryEntries(plantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch diary entries"})
		return
	}

	responses := make([]models.DiaryEntryResponse, 0, len(entries))
	for _, e := range entries {
		responses = append(responses, e.ToResponse())
	}

	c.JSON(http.StatusOK, responses)
}

func RegisterRoutes(router *gin.Engine) error {
	plantService := services.NewPlantService(db.GetDB())

	aiService, err := services.NewAIService(config.Settings_Instance.GeminiAPIKey)
	if err != nil {
		return fmt.Errorf("failed to initialize AI service: %w", err)
	}

	handler := NewPlantHandler(plantService, aiService)

	plants := router.Group("/api/v1/plants")
	{
		plants.POST("", handler.CreatePlant)
		plants.GET("", handler.ListPlants)
		plants.GET("/:plant_id", handler.GetPlant)
		plants.POST("/:plant_id/analyze", handler.AnalyzePlant)
		plants.GET("/:plant_id/diary", handler.GetDiary)
	}

	return nil
}
