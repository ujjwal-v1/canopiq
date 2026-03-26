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

func (s *PlantService) CreatePlant(data models.PlantCreateRequest) (*models.Plant, error) {
	plant := &models.Plant{
		Name:    data.Name,
		Species: data.Species,
	}

	if err := s.db.Create(plant).Error; err != nil {
		return nil, err
	}

	return plant, nil
}

func (s *PlantService) ListPlants() ([]models.Plant, error) {
	var plants []models.Plant
	if err := s.db.Order("created_at DESC").Find(&plants).Error; err != nil {
		return nil, err
	}
	return plants, nil
}

func (s *PlantService) GetPlant(plantID string) (*models.Plant, error) {
	var plant models.Plant
	if err := s.db.Where("id = ?", plantID).First(&plant).Error; err != nil {
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
		plant, _ := s.GetPlant(plantID)
		if plant != nil && plant.Species == nil {
			s.db.Model(plant).Update("species", analysis.PlantType)
		}
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
