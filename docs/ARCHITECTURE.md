# Canopiq — Architecture Overview

## System Design

```
Browser (React SPA)
        │  multipart/form-data (image) + Bearer JWT
        ▼
  Go / Gin Backend  ──► Gemini 2.5 Flash Lite (Vision)
        │                       │
        │  AnalysisResult JSON  │
        ◄───────────────────────┘
        │
        ├──► PostgreSQL (Plants + DiaryEntries, scoped by user_id)
        │
        └──► Cloudflare R2 (image storage, S3-compatible)

Auth flow:
  Browser ──► Clerk (sign-in) ──► JWT
  JWT sent on every request via Authorization: Bearer
  Go middleware validates JWT against Clerk's JWKS endpoint
```

## Key Design Decisions

### Why Gin (Go) over FastAPI (Python)?
- Single compiled binary — no runtime, faster cold start (~100ms vs ~2-3s)
- Lower memory footprint (~50MB vs ~200MB)
- Type safety without a separate schema layer

### Why Clerk for auth?
- Handles OAuth, magic links, MFA out of the box
- JWT validation via JWKS — no user table or session storage needed
- `user_id` is just the JWT `sub` claim, used as a filter on every DB query

### Why Cloudflare R2 for storage?
- S3-compatible API — drop-in with the AWS SDK
- Free tier: 10GB storage, 1M writes, 10M reads/month
- Images survive backend redeployments (Railway's filesystem is ephemeral)
- `STORAGE_BACKEND=local` fallback keeps local dev zero-config

### Why Zustand over Redux?
- Minimal boilerplate for a focused app
- Async actions without middleware
- Easy to extend as state grows

## Database Schema

```
plants
  id          UUID PK
  user_id     VARCHAR NOT NULL INDEX   ← scopes all queries per Clerk user
  name        VARCHAR(100)
  species     VARCHAR(200)             ← AI-populated on first analysis
  created_at  TIMESTAMP
  updated_at  TIMESTAMP

diary_entries
  id                UUID PK
  plant_id          FK → plants.id (CASCADE DELETE)
  image_url         VARCHAR             ← R2 public URL or local path
  health_status     VARCHAR(50)         ← Good | Fair | Poor
  overall_condition TEXT
  deficiencies      JSONB
  tips              JSONB
  diary_note        TEXT
  created_at        TIMESTAMP
```

## API Endpoints

All plant routes require `Authorization: Bearer <clerk-jwt>`.

| Method | Path                            | Description                            |
|--------|---------------------------------|----------------------------------------|
| GET    | /health                         | Health check (unauthenticated)         |
| POST   | /api/v1/plants                  | Create plant                           |
| GET    | /api/v1/plants                  | List plants (current user only)        |
| GET    | /api/v1/plants/:id              | Get single plant                       |
| POST   | /api/v1/plants/:id/analyze      | Upload image → AI diagnosis → diary    |
| GET    | /api/v1/plants/:id/diary        | Get diary entries                      |

## Frontend Components

```
src/
├── pages/
│   ├── LandingPage.tsx        # Shown to unauthenticated visitors
│   ├── DashboardPage.tsx      # Plant list (signed-in)
│   ├── PlantPage.tsx          # Plant detail + upload + diary + trend chart
│   └── NewPlantPage.tsx       # Create plant form
├── components/
│   ├── HealthTrendChart.tsx   # Recharts line chart (Good/Fair/Poor over time)
│   ├── HealthBadge.tsx        # Coloured status pill
│   ├── DiaryEntryCard.tsx     # Single diary entry
│   ├── UploadZone.tsx         # Drag-and-drop / file picker
│   ├── Layout.tsx             # Shell with nav + UserButton
│   └── ClerkAxiosInterceptor  # Attaches JWT to every Axios request
└── services/
    └── api.ts                 # Axios client + plantApi methods
```
