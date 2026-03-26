# Canopiq Backend - Go Migration

This is the Go version of the Canopiq backend, migrated from Python/FastAPI.

## Prerequisites

- Go 1.21+
- PostgreSQL 16+
- Gemini API key

## Setup

### 1. Install Go Dependencies

```bash
go mod download
```

### 2. Environment Variables

Create a `.env` file in the backend directory:

```bash
APP_ENV=development
SECRET_KEY=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
DATABASE_URL=postgresql://canopiq:password@localhost:5432/canopiq
CORS_ORIGINS=http://localhost:5173
STORAGE_BACKEND=local
STORAGE_LOCAL_PATH=./uploads
PORT=8000
```

### 3. Database Setup

Make sure PostgreSQL is running and the database exists:

```bash
createdb -U canopiq canopiq
```

## Running the Application

### Local Development

```bash
go run main.go
```

The server will start on `http://localhost:8000`

### Docker

```bash
docker-compose up --build
```

## Project Structure

```
backend/
├── config/          # Configuration management
├── db/              # Database initialization
├── models/          # Data models and DTOs
├── services/        # Business logic
│   ├── plant_service.go
│   └── ai_service.go
├── routes/          # API endpoints
├── main.go          # Entry point
├── go.mod           # Go module definition
└── Dockerfile       # Docker configuration
```

## API Endpoints

- `GET /health` - Health check
- `POST /plants` - Create a plant
- `GET /plants` - List all plants
- `GET /plants/:plant_id` - Get a plant
- `POST /plants/:plant_id/analyze` - Analyze plant image
- `GET /plants/:plant_id/diary` - Get plant diary entries

## Differences from Python Version

- **Framework**: FastAPI → Gin
- **ORM**: SQLAlchemy → GORM
- **Database Driver**: asyncpg → pgx
- **AI Client**: httpx → google-generative-ai-go
- **Language**: Python 3.12 → Go 1.21

## Building

To build the binary:

```bash
go build -o backend
```

## Testing

Run tests with:

```bash
go test ./...
```

## Database Migrations

GORM's auto-migration is used. To run migrations manually:

```go
db.AutoMigrate(&models.Plant{}, &models.DiaryEntry{})
```

## Troubleshooting

### Database Connection Issues

Ensure PostgreSQL is running and accessible:

```bash
psql -U canopiq -d canopiq -c "SELECT 1"
```

### Gemini API Errors

- Verify `GEMINI_API_KEY` is set correctly
- Check API key has proper permissions
- Ensure network access to Google APIs

### Build Issues

If you get `cgo` compilation errors, ensure:

```bash
# On macOS
xcode-select --install

# On Linux
sudo apt-get install build-essential postgresql-dev
```
