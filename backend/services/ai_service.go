package services

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
)

const analysisPrompt = `You are an expert botanist and plant health specialist.
Analyze this plant photo carefully and respond ONLY in this exact JSON format,
no markdown, no preamble:

{
  "plantType": "identified plant species or type",
  "healthStatus": "Good" | "Fair" | "Poor",
  "overallCondition": "2-3 sentence plain summary of current condition",
  "deficiencies": ["specific issue 1", "specific issue 2"],
  "tips": ["Actionable tip 1", "Actionable tip 2", "Actionable tip 3"],
  "diaryNote": "One natural, warm sentence summarizing this check-in"
}`

type AnalysisResult struct {
	PlantType        string   `json:"plantType"`
	HealthStatus     string   `json:"healthStatus"`
	OverallCondition string   `json:"overallCondition"`
	Deficiencies     []string `json:"deficiencies"`
	Tips             []string `json:"tips"`
	DiaryNote        *string  `json:"diaryNote"`
}

type AIService struct {
	apiKey string
}

func NewAIService(apiKey string) (*AIService, error) {
	return &AIService{
		apiKey: apiKey,
	}, nil
}

type geminiContentPart struct {
	Text       *string           `json:"text,omitempty"`
	InlineData *geminiInlineData `json:"inlineData,omitempty"`
}

type geminiInlineData struct {
	MimeType string `json:"mimeType"`
	Data     string `json:"data"`
}

type geminiContent struct {
	Parts []geminiContentPart `json:"parts"`
}

type geminiRequest struct {
	Contents         []geminiContent        `json:"contents"`
	GenerationConfig geminiGenerationConfig `json:"generationConfig"`
}

type geminiGenerationConfig struct {
	Temperature     float32 `json:"temperature"`
	MaxOutputTokens int     `json:"maxOutputTokens"`
}

type geminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
}

var mdFenceRe = regexp.MustCompile("(?s)^```(?:json)?\\s*(.*?)\\s*```$")

func stripMarkdownFences(s string) string {
	s = strings.TrimSpace(s)
	if m := mdFenceRe.FindStringSubmatch(s); m != nil {
		return m[1]
	}
	return s
}

func (s *AIService) AnalyzePlantImage(imageBytes []byte, mediaType string) (*AnalysisResult, error) {
	if s.apiKey == "" {
		return nil, fmt.Errorf("GEMINI_API_KEY is not set")
	}

	b64 := base64.StdEncoding.EncodeToString(imageBytes)
	prompt := analysisPrompt

	payload := geminiRequest{
		Contents: []geminiContent{
			{
				Parts: []geminiContentPart{
					{
						InlineData: &geminiInlineData{
							MimeType: mediaType,
							Data:     b64,
						},
					},
					{
						Text: &prompt,
					},
				},
			},
		},
		GenerationConfig: geminiGenerationConfig{
			Temperature:     0.2,
			MaxOutputTokens: 1024,
		},
	}

	payloadJSON, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=%s", s.apiKey)

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(payloadJSON))
	if err != nil {
		return nil, fmt.Errorf("failed to call Gemini API: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Gemini API error: status %d, body: %s", resp.StatusCode, string(body))
	}

	var data geminiResponse
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	if len(data.Candidates) == 0 || len(data.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("empty response from Gemini API")
	}

	rawText := data.Candidates[0].Content.Parts[0].Text
	rawText = stripMarkdownFences(rawText)

	var result AnalysisResult
	if err := json.Unmarshal([]byte(rawText), &result); err != nil {
		return nil, fmt.Errorf("failed to parse AI response: %w", err)
	}

	return &result, nil
}
