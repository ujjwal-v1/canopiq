# Canopiq

> AI-powered plant health monitoring with a personal diary for every plant.

Canopiq lets you photograph your plants, get instant AI-driven health diagnostics, and maintain a rich care history — all from your phone or browser.

---

## Project Structure

```
canopiq/
├── frontend/          # React (Vite + TypeScript)
├── backend/           # Go (Gin)
├── docs/              # Architecture docs
└── .github/workflows/ # CI/CD pipelines
```

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 18, TypeScript, Vite, Zustand             |
| Styling   | Tailwind CSS                                    |
| Backend   | Go 1.24 + Gin Web Framework                     |
| ORM       | GORM with PostgreSQL                            |
| Database  | PostgreSQL                                      |
| AI        | Google Gemini 2.5 Flash Lite (Vision)           |
| Storage   | Cloudflare R2 (prod) / local filesystem (dev)   |
| Auth      | Clerk (JWT, per-user plant data)                |
| Deploy    | Docker + Railway                                |

## Getting Started

### Prerequisites
- Node.js 20+
- Go 1.24+
- PostgreSQL 16+

### 1. Clone & set up env

```bash
git clone https://github.com/<you>/canopiq.git
cd canopiq
```

**`backend/.env`:**
```env
APP_ENV=development
SECRET_KEY=change-me
GEMINI_API_KEY=your-gemini-api-key
DATABASE_URL=postgresql://canopiq:password@localhost:5432/canopiq
CORS_ORIGINS=http://localhost:5173
STORAGE_BACKEND=local
STORAGE_LOCAL_PATH=./uploads
PORT=8000
```

**`frontend/.env`:**
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

> For local dev, `STORAGE_BACKEND=local` stores images on disk. Set `STORAGE_BACKEND=s3` with R2 credentials for persistent storage.
> Auth middleware only initialises when `CLERK_JWKS_URL` is set; omit it for unauthenticated local testing.

### 2. Run locally

**Backend:**
```bash
cd backend
go run main.go
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Phase Roadmap

- [x] **Phase 1** — Core: photo upload, AI diagnosis, plant diary
- [x] **Phase 2** — Auth (Clerk), R2 image storage, health trend chart
- [ ] **Phase 3** — Claude Vision upgrade, multi-image comparison, care calendar
- [ ] **Phase 4** — PWA / mobile camera API, push notifications
- [ ] **Phase 5** — Public plant profiles, species encyclopedia

## Deployed Services

| Service  | URL |
|----------|-----|
| Frontend | https://shimmering-mindfulness-production-90fa.up.railway.app |
| Backend  | https://canopiq-production.up.railway.app |
| Health   | https://canopiq-production.up.railway.app/health |
