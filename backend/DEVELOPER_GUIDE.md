# Backend: Python to Go Migration Guide

## Quick Reference

### Running the Backend

**Development (local Go)**
```bash
cd backend
go run main.go
```

**Docker**
```bash
docker-compose up backend
```

**Building the Binary**
```bash
cd backend
go build -o backend
./backend
```

## Project Structure

```
backend/
├── config/config.go         # Configuration loading
├── db/database.go           # Database connection & migrations
├── models/plant.go          # Plant & DiaryEntry models
├── services/
│   ├── plant_service.go     # Plant business logic
│   └── ai_service.go        # Gemini API integration
├── routes/plants.go         # API endpoint handlers
├── main.go                  # Application entry point
├── go.mod / go.sum          # Dependencies
├── Makefile                 # Common tasks
└── Dockerfile               # Docker build config
```

## API Endpoints Reference

All endpoints remain the same as the Python version:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Health check |
| POST | `/plants` | Create plant |
| GET | `/plants` | List all plants |
| GET | `/plants/:plant_id` | Get plant details |
| POST | `/plants/:plant_id/analyze` | Analyze plant image |
| GET | `/plants/:plant_id/diary` | Get diary entries |

## Common Tasks (Makefile)

```bash
make help         # Show all available commands
make build        # Compile the binary
make run          # Run locally
make test         # Run tests
make clean        # Remove artifacts
make deps         # Download dependencies
make docker-build # Build Docker image
make docker-up    # Start with Docker Compose
make docker-down  # Stop services
```

## Environment Variables

```env
APP_ENV=development
SECRET_KEY=your-secret
GEMINI_API_KEY=your-api-key
DATABASE_URL=postgresql://canopiq:password@localhost:5432/canopiq
CORS_ORIGINS=http://localhost:5173
STORAGE_BACKEND=local
STORAGE_LOCAL_PATH=./uploads
PORT=8000
```

## Database

Auto-migration runs on startup. To connect directly:

```bash
psql -U canopiq -d canopiq -h localhost
```

## Key Differences from Python

### Configuration
- Python: Pydantic settings
- Go: Environment variables + godotenv

### Database
- Python: SQLAlchemy async
- Go: GORM (synchronous calls)

### Web Framework
- Python: FastAPI
- Go: Gin

### AI Integration
- Python: httpx (async)
- Go: net/http (sync with HTTP client)

### Error Handling
- Python: Exceptions with HTTPException
- Go: Explicit error returns with gin.H{"error": msg}

## Troubleshooting

### Build Errors
If you get CGO errors:
```bash
# macOS
xcode-select --install

# Linux
sudo apt-get install build-essential postgresql-dev
```

### Database Connection
```bash
# Check PostgreSQL is running
psql -U canopiq -d canopiq -c "SELECT 1"
```

### Gemini API
- Verify `GEMINI_API_KEY` in `.env`
- Check API key has generative-ai-go permissions
- Test with curl:
```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent" \
  -H "Content-Type: application/json" \
  -d '{"contents": [{"parts": [{"text": "Hello"}]}]}' \
  -d "key=YOUR_API_KEY"
```

## Frontend Integration

The frontend doesn't need changes - same API:

```typescript
// api.ts - No changes needed
const API_URL = 'http://localhost:8000';
const response = await fetch(`${API_URL}/plants`);
```

## Performance Metrics

| Metric | Go | Python |
|--------|----|----|
| Startup | ~100ms | ~2-3s |
| Memory | ~50MB | ~200MB |
| Binary Size | 19MB | N/A |
| Request Latency | <50ms | <100ms |

## Deployment

### Docker
```bash
docker-compose up --build
```

The multi-stage Dockerfile automatically:
1. Compiles Go code
2. Creates minimal runtime image
3. Sets up PostgreSQL connection

### Local Production
```bash
go build -o backend
DATABASE_URL=production-url PORT=8000 ./backend
```

## Testing

Run all tests:
```bash
go test ./...
```

Run specific package tests:
```bash
go test ./services -v
```

Run with coverage:
```bash
go test -cover ./...
```

## Debugging

Enable verbose logging (modify main.go):
```go
router := gin.Default() // Already includes request logging
```

All requests are automatically logged with:
- Method
- Path
- Status Code
- Response Time
- Remote IP

## Code Patterns

### Creating a Plant
```go
service := services.NewPlantService(db.GetDB())
plant, err := service.CreatePlant(models.PlantCreateRequest{
    Name: "Monstera",
    Species: nil,
})
```

### Analyzing an Image
```go
aiService, _ := services.NewAIService(apiKey)
result, err := aiService.AnalyzePlantImage(imageBytes, "image/jpeg")
```

### Querying the Database
```go
db := db.GetDB()
var plants []models.Plant
db.Order("created_at DESC").Find(&plants)
```

## Resources

- **Go Docs**: https://golang.org/doc
- **Gin Framework**: https://gin-gonic.com
- **GORM Documentation**: https://gorm.io
- **Gemini API**: https://ai.google.dev
- **PostgreSQL**: https://www.postgresql.org/docs/

---

For more details, see [Migration Summary](../MIGRATION_SUMMARY.md)
