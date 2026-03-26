package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type HealthStatus string

const (
	Good HealthStatus = "Good"
	Fair HealthStatus = "Fair"
	Poor HealthStatus = "Poor"
)

func (hs HealthStatus) Value() (driver.Value, error) {
	return string(hs), nil
}

func (hs *HealthStatus) Scan(value interface{}) error {
	*hs = HealthStatus(value.(string))
	return nil
}

type Plant struct {
	ID        string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Name      string    `gorm:"type:varchar(100);not null" json:"name"`
	Species   *string   `gorm:"type:varchar(200)" json:"species"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	DiaryEntries []DiaryEntry `gorm:"foreignKey:PlantID;constraint:OnDelete:Cascade" json:"diary_entries,omitempty"`
}

type DiaryEntry struct {
	ID               string       `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	PlantID          string       `gorm:"type:uuid;not null;index" json:"plant_id"`
	ImageURL         *string      `gorm:"type:varchar" json:"image_url"`
	HealthStatus     HealthStatus `gorm:"type:varchar(50)" json:"health_status"`
	OverallCondition string       `gorm:"type:text" json:"overall_condition"`
	Deficiencies     []byte       `gorm:"type:jsonb" json:"deficiencies"`
	Tips             []byte       `gorm:"type:jsonb" json:"tips"`
	DiaryNote        *string      `gorm:"type:text" json:"diary_note"`
	CreatedAt        time.Time    `gorm:"autoCreateTime" json:"created_at"`

	Plant *Plant `gorm:"foreignKey:PlantID;constraint:OnDelete:Cascade" json:"plant,omitempty"`
}

func (p *Plant) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = uuid.New().String()
	}
	return nil
}

func (d *DiaryEntry) BeforeCreate(tx *gorm.DB) error {
	if d.ID == "" {
		d.ID = uuid.New().String()
	}
	return nil
}

type PlantCreateRequest struct {
	Name    string  `json:"name" binding:"required"`
	Species *string `json:"species"`
}

type PlantResponse struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Species   *string   `json:"species"`
	CreatedAt time.Time `json:"created_at"`
}

type DiaryEntryResponse struct {
	ID               string       `json:"id"`
	PlantID          string       `json:"plant_id"`
	ImageURL         *string      `json:"image_url"`
	HealthStatus     HealthStatus `json:"health_status"`
	OverallCondition string       `json:"overall_condition"`
	Deficiencies     []string     `json:"deficiencies"`
	Tips             []string     `json:"tips"`
	DiaryNote        *string      `json:"diary_note"`
	CreatedAt        time.Time    `json:"created_at"`
}

func (p *Plant) ToResponse() PlantResponse {
	return PlantResponse{
		ID:        p.ID,
		Name:      p.Name,
		Species:   p.Species,
		CreatedAt: p.CreatedAt,
	}
}

func (d *DiaryEntry) ToResponse() DiaryEntryResponse {
	deficiencies := []string{}
	tips := []string{}

	if len(d.Deficiencies) > 0 {
		json.Unmarshal(d.Deficiencies, &deficiencies)
	}

	if len(d.Tips) > 0 {
		json.Unmarshal(d.Tips, &tips)
	}

	return DiaryEntryResponse{
		ID:               d.ID,
		PlantID:          d.PlantID,
		ImageURL:         d.ImageURL,
		HealthStatus:     d.HealthStatus,
		OverallCondition: d.OverallCondition,
		Deficiencies:     deficiencies,
		Tips:             tips,
		DiaryNote:        d.DiaryNote,
		CreatedAt:        d.CreatedAt,
	}
}
