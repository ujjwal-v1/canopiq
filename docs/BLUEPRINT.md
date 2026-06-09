# Canopiq — Product Blueprint & Next Steps

## Current State (as of June 2026)

- [x] Go/Gin backend deployed on Railway
- [x] React/TypeScript frontend deployed on Railway  
- [x] PostgreSQL database (Railway addon)
- [x] Gemini AI vision analysis working end-to-end
- [x] Multi-plant support (create, view, diary)
- [x] Photo upload → AI diagnosis → diary entry
- [x] Docker multi-stage production build
- [x] GitHub Actions CI/CD pipeline

---

## Phase 2 — Make It Real

### 2A · Persistent Image Storage (Cloudflare R2)
> Uploaded photos are lost on every Railway redeploy. R2 is free and S3-compatible.

- [ ] Create Cloudflare account + R2 bucket
- [ ] Add R2 credentials to Railway backend env vars:
  - `STORAGE_BACKEND=s3`
  - `S3_BUCKET=canopiq-uploads`
  - `S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com`
  - `AWS_ACCESS_KEY_ID=<r2-key>`
  - `AWS_SECRET_ACCESS_KEY=<r2-secret>`
- [ ] Implement S3 upload in `backend/services/storage_service.go`
- [ ] Update `routes/plants.go` to call storage service on analyze
- [ ] Update `STORAGE_LOCAL_PATH` fallback for local dev
- [ ] Test: upload photo → verify image persists after backend redeploy

### 2B · Authentication (Clerk)
> Without auth, all plants are visible to every visitor.

- [ ] Create Clerk account, create application
- [ ] Add Clerk publishable key to Railway frontend env: `VITE_CLERK_PUBLISHABLE_KEY`
- [ ] `cd frontend && npm install @clerk/clerk-react`
- [ ] Wrap `App.tsx` with `<ClerkProvider>`
- [ ] Add `<SignIn />` / `<SignUp />` pages
- [ ] Protect routes with `<SignedIn>` / `<SignedOut>` guards
- [ ] Pass Clerk JWT to backend via `Authorization: Bearer <token>` header
- [ ] Add JWT middleware to Go backend (validate Clerk tokens)
- [ ] Add `user_id` column to `plants` table, filter all queries by user
- [ ] Test: two separate accounts see separate plant collections

### 2C · Health Trend Chart
> Visualize Good/Fair/Poor history per plant over time.

- [ ] `cd frontend && npm install recharts`
- [ ] Add health score mapping: `Good=3, Fair=2, Poor=1`
- [ ] Create `HealthTrendChart.tsx` component using Recharts `LineChart`
- [ ] Add chart to `PlantPage.tsx` above the diary section
- [ ] Show last 10 diary entries on X-axis (date), health score on Y-axis
- [ ] Color-code line: green for ≥2.5, yellow for ≥1.5, red for <1.5
- [ ] Test: multiple analyses show trend line updating

---

## Phase 3 — AI Upgrades

### 3A · Upgrade to Claude Vision
> Claude claude-sonnet-4-6 gives better botanical reasoning than Gemini flash-lite.

- [ ] Add `ANTHROPIC_API_KEY` to Railway backend env vars
- [ ] `cd backend && go get github.com/anthropics/anthropic-sdk-go`
- [ ] Rewrite `backend/services/ai_service.go` to use Claude claude-sonnet-4-6
- [ ] Update prompt to leverage Claude's stronger structured output
- [ ] Add confidence scores to `AnalysisResult` struct: `Confidence float64`
- [ ] Display confidence % next to health status badge in frontend
- [ ] Test: same photo → compare Claude vs Gemini output quality

### 3B · Multi-Image Comparison
> "Has my plant improved since last week?"

- [ ] Add `GET /api/v1/plants/:id/compare?from=<diary_id>&to=<diary_id>` endpoint
- [ ] Send both images + both diagnoses to Claude: "Did this plant improve?"
- [ ] Return structured comparison: `{ improved: bool, changes: string[], advice: string }`
- [ ] Add "Compare with previous" button on diary entries in frontend
- [ ] Test: upload two photos of same plant, verify comparison makes sense

### 3C · Seasonal Care Calendar
> AI generates a week-by-week care plan based on species + current month.

- [ ] Add `POST /api/v1/plants/:id/care-plan` endpoint
- [ ] Send species name + current month to Claude: generate 4-week care schedule
- [ ] Return `{ weeks: [{ week: 1, tasks: string[] }] }`
- [ ] Add "Care Plan" tab to `PlantPage.tsx`
- [ ] Cache care plan in DB (regenerate monthly)
- [ ] Test: generate plan for a named species, verify tasks are season-appropriate

---

## Phase 4 — Mobile & PWA

### 4A · Progressive Web App
> Install on phone home screen, use camera directly.

- [ ] `cd frontend && npm install vite-plugin-pwa`
- [ ] Configure `vite-plugin-pwa` in `vite.config.ts`
- [ ] Create `public/manifest.json` with app name, icons, theme color
- [ ] Add service worker for offline shell caching
- [ ] Replace `<input type="file">` with `getUserMedia` camera API on mobile
- [ ] Add `apple-touch-icon` meta tags
- [ ] Test: install on iPhone/Android, open camera from app, take photo

### 4B · Push Notifications (Watering Reminders)
> Remind users to water plants on a schedule.

- [ ] Add `watering_interval_days` column to `plants` table
- [ ] Add watering interval picker to `PlantPage.tsx`
- [ ] Implement Web Push subscription in frontend (VAPID keys)
- [ ] Add `POST /api/v1/push/subscribe` endpoint, store subscription in DB
- [ ] Add cron job in backend: daily check for overdue watering → send push
- [ ] Test: set 1-day interval, wait, verify push notification arrives

---

## Phase 5 — Community & Scale

### 5A · Public Plant Profiles
> Share a plant's health journey publicly.

- [ ] Add `is_public bool` column to `plants`
- [ ] Add "Make Public" toggle on `PlantPage.tsx`
- [ ] Add `GET /api/v1/public/plants/:id` unauthenticated endpoint
- [ ] Create `PublicPlantPage.tsx` at `/p/:id` route
- [ ] Add copy-link button that generates shareable URL
- [ ] Test: make a plant public, open URL in incognito, verify it loads

### 5B · Plant Encyclopedia
> AI-generated species cards with care guides.

- [ ] Create `species` table: `name, care_guide, watering_freq, sunlight, difficulty`
- [ ] On first AI analysis, if species identified → generate + cache a species card
- [ ] Add `GET /api/v1/species/:name` endpoint
- [ ] Create `SpeciesCard.tsx` component, show on `PlantPage.tsx`
- [ ] Test: analyze a plant, verify species card is generated and displayed

---

## Infrastructure Checklist (do before Phase 5)

- [ ] Switch Railway images from ephemeral to Volume mount (or use R2 — Phase 2A)
- [ ] Add rate limiting to `/analyze` endpoint (Gemini/Claude API costs money)
- [ ] Set up error monitoring (Sentry — free tier)
- [ ] Add structured logging to Go backend (`slog` package)
- [ ] Set up database backups (Railway auto-backup or `pg_dump` cron)
- [ ] Tighten CORS: replace `*` with actual frontend domain in `main.go`
- [ ] Rotate `SECRET_KEY` to a real random value in Railway env

---

## Learning Path (Claude Code + Agents)

- [ ] Run `/init` to generate `CLAUDE.md` — teaches me your codebase deeply
- [ ] Run `/review` before each feature PR to catch issues early
- [ ] Run `/security-review` before adding auth
- [ ] Set up a hook: auto-run `go test ./...` after every Go file edit
  - Use `/update-config` → tell me "run go test after every backend edit"
- [ ] Try spawning agents: "research best Go JWT validation library and report back"
- [ ] Use `/simplify` after a feature is done to clean up the implementation

---

## Quick Reference

| Service | URL |
|---|---|
| Frontend | https://shimmering-mindfulness-production-90fa.up.railway.app |
| Backend | https://canopiq-production.up.railway.app |
| Health check | https://canopiq-production.up.railway.app/health |

| Priority | Feature | Effort |
|---|---|---|
| 🔴 High | R2 image storage | 1 hr |
| 🔴 High | Auth (Clerk) | 2–3 hrs |
| 🟡 Medium | Health trend chart | 1 hr |
| 🟡 Medium | Claude vision upgrade | 30 min |
| 🟢 Nice | Seasonal care calendar | 2 hrs |
| 🟢 Nice | PWA + camera | 2 hrs |
