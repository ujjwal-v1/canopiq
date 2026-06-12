# Backend Developer Guide

## Running

```bash
cd backend
go run main.go          # local dev
go build -o backend .   # build binary
go test ./...           # run tests
```

## Project Structure

```
backend/
├── config/config.go         # All env vars loaded here
├── db/database.go           # GORM init, auto-migrate
├── middleware/auth.go       # RequireAuth() — Clerk JWT via JWKS
├── models/plant.go          # Plant, DiaryEntry models + DTOs
├── services/
│   ├── ai_service.go        # Gemini 2.5 Flash Lite integration
│   ├── plant_service.go     # DB queries scoped by user_id
│   └── storage_service.go   # R2 upload (or local fallback)
├── routes/plants.go         # Gin handlers, wires services together
└── main.go                  # Startup: config → DB → JWKS → router
```

## Environment Variables

| Variable              | Required        | Description                                  |
|-----------------------|-----------------|----------------------------------------------|
| `GEMINI_API_KEY`      | yes             | Google AI API key                            |
| `DATABASE_URL`        | yes             | PostgreSQL connection string                 |
| `SECRET_KEY`          | yes             | App secret (rotate in prod)                  |
| `STORAGE_BACKEND`     | no (def: local) | `local` or `s3`                              |
| `STORAGE_LOCAL_PATH`  | no (def: ./uploads) | Path for local image storage             |
| `S3_BUCKET`           | if s3           | R2 bucket name                               |
| `S3_ENDPOINT`         | if s3           | `https://<id>.r2.cloudflarestorage.com`      |
| `S3_PUBLIC_URL`       | if s3           | `https://pub-xxx.r2.dev`                     |
| `AWS_ACCESS_KEY_ID`   | if s3           | R2 API key ID                                |
| `AWS_SECRET_ACCESS_KEY` | if s3         | R2 API secret                                |
| `CLERK_JWKS_URL`      | prod only       | `https://<clerk-domain>/.well-known/jwks.json` |
| `CORS_ORIGINS`        | no (def: localhost:5173) | Comma-separated allowed origins     |
| `PORT`                | no (def: 8000)  | HTTP listen port                             |

## Auth Flow

1. `main.go` calls `middleware.InitJWKS(cfg.ClerkJWKSURL)` on startup — fetches and caches Clerk's public keys
2. All `/api/v1/plants` routes go through `middleware.RequireAuth()`
3. Middleware extracts `sub` claim from the JWT and sets `user_id` in the Gin context
4. Handlers read `c.GetString("user_id")` and pass it to `PlantService`
5. Every DB query filters by `user_id` — users never see each other's data

If `CLERK_JWKS_URL` is not set, JWKS is not initialised and `RequireAuth()` returns 500. For local dev without auth, comment out the `RequireAuth()` middleware in `routes/plants.go` and hard-code a `user_id`.

## Storage Flow

`STORAGE_BACKEND=local` — images saved to `STORAGE_LOCAL_PATH`, served via `/uploads/*` static route. Lost on redeploy.

`STORAGE_BACKEND=s3` — images uploaded to Cloudflare R2 via AWS SDK v2 (path-style, region `auto`). `StorageService` is initialised in `RegisterRoutes` and injected into `PlantHandler`.

## Adding a New Endpoint

1. Add handler method to `PlantHandler` in `routes/plants.go`
2. Register the route in `RegisterRoutes`
3. Add any DB logic to `PlantService` (always scope by `user_id`)

## Common Code Patterns

```go
// Read user from context (set by RequireAuth middleware)
userID := c.GetString("user_id")

// Query scoped to user
s.db.Where("id = ? AND user_id = ?", plantID, userID).First(&plant)

// Upload image to R2
url, err := h.storageService.UploadImage(c.Request.Context(), imageBytes, mediaType)
```

## Troubleshooting

**401 on all requests** — `CLERK_JWKS_URL` is set but wrong, or the frontend isn't attaching the JWT.

**500 "auth not configured"** — `CLERK_JWKS_URL` env var is missing on the server.

**R2 upload fails** — check `S3_ENDPOINT` format (`https://` prefix required), verify bucket public access is enabled in the Cloudflare dashboard.

**DB connection refused** — verify `DATABASE_URL` and that PostgreSQL is running:
```bash
psql "$DATABASE_URL" -c "SELECT 1"
```
