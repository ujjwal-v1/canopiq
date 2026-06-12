# Canopiq Backend

Go + Gin REST API for Canopiq.

## Prerequisites

- Go 1.24+
- PostgreSQL 16+
- Gemini API key

## Setup

### 1. Install dependencies

```bash
go mod download
```

### 2. Environment variables

Create `backend/.env`:

```env
APP_ENV=development
SECRET_KEY=change-me
GEMINI_API_KEY=your-gemini-api-key
DATABASE_URL=postgresql://canopiq:password@localhost:5432/canopiq
CORS_ORIGINS=http://localhost:5173
PORT=8000

# Storage (choose one)
STORAGE_BACKEND=local
STORAGE_LOCAL_PATH=./uploads

# R2 (only needed when STORAGE_BACKEND=s3)
S3_BUCKET=canopiq-uploads
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_PUBLIC_URL=https://pub-xxx.r2.dev
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Auth (omit for unauthenticated local dev)
CLERK_JWKS_URL=https://<clerk-domain>/.well-known/jwks.json
```

### 3. Run

```bash
go run main.go
```

Server starts on `http://localhost:8000`. GORM auto-migrates the schema on startup.

## Project Structure

```
backend/
├── config/
│   └── config.go          # Env var loading
├── db/
│   └── database.go        # GORM init + auto-migrate
├── middleware/
│   └── auth.go            # Clerk JWT validation (JWKS)
├── models/
│   └── plant.go           # Plant, DiaryEntry, request/response types
├── routes/
│   └── plants.go          # HTTP handlers
├── services/
│   ├── ai_service.go      # Gemini API integration
│   ├── plant_service.go   # DB queries (scoped by user_id)
│   └── storage_service.go # R2 / local image storage
├── main.go
├── go.mod
└── Dockerfile
```

## API Endpoints

All `/api/v1/plants` routes require `Authorization: Bearer <clerk-jwt>`.

| Method | Path                         | Description                        |
|--------|------------------------------|------------------------------------|
| GET    | /health                      | Health check                       |
| POST   | /api/v1/plants               | Create plant                       |
| GET    | /api/v1/plants               | List plants (current user)         |
| GET    | /api/v1/plants/:id           | Get plant                          |
| POST   | /api/v1/plants/:id/analyze   | Upload image → AI diagnosis        |
| GET    | /api/v1/plants/:id/diary     | Get diary entries                  |

## Building

```bash
go build -o backend .
```

## Testing

```bash
go test ./...
```
