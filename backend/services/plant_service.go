package services

import (
	"encoding/json"

	"canopiq/models"

	"gorm.io/gorm"
)

type PlantService struct {
	db *gorm.DB
}

func NewPlantService(db *gorm.DB) *PlantService {
	return &PlantService{db: db}
}

func (s *PlantService) CreatePlant(data models.PlantCreateRequest, userID string) (*models.Plant, error) {
	plant := &models.Plant{
		UserID:  userID,
		Name:    data.Name,
		Species: data.Species,
	}

	if err := s.db.Create(plant).Error; err != nil {
		return nil, err
	}

	return plant, nil
}

func (s *PlantService) ListPlants(userID string) ([]models.Plant, error) {
	var plants []models.Plant
	if err := s.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&plants).Error; err != nil {
		return nil, err
	}
	return plants, nil
}

func (s *PlantService) GetPlant(plantID string, userID string) (*models.Plant, error) {
	var plant models.Plant
	if err := s.db.Where("id = ? AND user_id = ?", plantID, userID).First(&plant).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &plant, nil
}

func (s *PlantService) AddDiaryEntry(plantID string, analysis AnalysisResult, imageURL *string) (*models.DiaryEntry, error) {
	deficiencies, _ := json.Marshal(analysis.Deficiencies)
	tips, _ := json.Marshal(analysis.Tips)

	entry := &models.DiaryEntry{
		PlantID:          plantID,
		ImageURL:         imageURL,
		HealthStatus:     models.HealthStatus(analysis.HealthStatus),
		OverallCondition: analysis.OverallCondition,
		Deficiencies:     deficiencies,
		Tips:             tips,
		DiaryNote:        analysis.DiaryNote,
	}

	if err := s.db.Create(entry).Error; err != nil {
		return nil, err
	}

	if analysis.PlantType != "" {
		s.db.Model(&models.Plant{}).Where("id = ? AND species IS NULL", plantID).
			Update("species", analysis.PlantType)
	}

	return entry, nil
}

func (s *PlantService) ListDiaryEntries(plantID string) ([]models.DiaryEntry, error) {
	var entries []models.DiaryEntry
	if err := s.db.Where("plant_id = ?", plantID).Order("created_at DESC").Find(&entries).Error; err != nil {
		return nil, err
	}
	return entries, nil
}
