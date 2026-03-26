# Canopiq — Architecture Overview

## System Design

```
Phone (Browser PWA)
        │  multipart/form-data (image)
        ▼
  FastAPI Backend  ──► Anthropic Claude Vision API
        │                       │
        │  AnalysisResult JSON  │
        ◄───────────────────────┘
        │
        ▼
  PostgreSQL DB
  (Plants + DiaryEntries)
        │
  Local/S3 Storage
  (raw images)
```

## Key Design Decisions

### Why FastAPI?
- Async-first: non-blocking image upload + Claude API call
- Auto-generated Swagger docs at `/docs`
- Pydantic models shared between schemas and validation

### Why Zustand over Redux?
- Much lower boilerplate for a focused app
- Async actions built-in without middleware
- Easy to scale as state grows

### Why store images locally (Phase 1)?
- Zero config to get started
- Swap `STORAGE_BACKEND=s3` in .env to migrate to S3/R2 in Phase 5 — service layer abstracts this

### Database schema
```
plants
  id          UUID PK
  name        VARCHAR(100)
  species     VARCHAR(200)   ← AI-populated on first analysis
  created_at  TIMESTAMP

diary_entries
  id              UUID PK
  plant_id        FK → plants.id
  image_url       VARCHAR
  health_status   ENUM(Good, Fair, Poor)
  overall_condition TEXT
  deficiencies    TEXT  (JSON array)
  tips            TEXT  (JSON array)
  diary_note      TEXT
  created_at      TIMESTAMP
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/v1/plants/ | Create plant |
| GET  | /api/v1/plants/ | List all plants |
| GET  | /api/v1/plants/:id | Get single plant |
| POST | /api/v1/plants/:id/analyze | Upload image → AI diagnosis → diary entry |
| GET  | /api/v1/plants/:id/diary | Get diary entries |
| GET  | /health | Health check |

## Adding Features

- **Auth**: Add `user_id` FK to `plants`. Use `python-jose` for JWT (already in requirements).
- **S3 storage**: In `plants.py` endpoint, branch on `settings.STORAGE_BACKEND == "s3"` and use `boto3`.
- **Health trend chart**: Query `diary_entries` ordered by `created_at`, map `health_status` to numeric score (Good=3, Fair=2, Poor=1), render with Recharts.
- **Push notifications**: Add a `reminders` table. Use a background task queue (e.g. ARQ with Redis) to fire web push.
