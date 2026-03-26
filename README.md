# 🌿 Canopiq

> AI-powered plant health monitoring with a personal diary for every plant.

Canopiq lets you photograph your plants, get instant AI-driven health diagnostics, and maintain a rich care history — all from your phone.

---

## Project Structure

```
canopiq/
├── frontend/          # React PWA (Vite + TypeScript)
├── backend/           # Go (Gin)
├── docs/              # Architecture docs, API specs
├── .github/workflows/ # CI/CD pipelines
└── MIGRATION_SUMMARY.md # Backend migration details
```

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, TypeScript, Vite, Zustand |
| Styling   | Tailwind CSS                      |
| Backend   | Go 1.21 + Gin Web Framework (Previously FastAPI/Python) |
| ORM       | GORM with PostgreSQL              |
| Database  | PostgreSQL                        |
| AI        | Google Gemini API (Vision)        |
| Storage   | Local filesystem or S3 (future)   |
| Auth      | JWT (future phase)                |
| Deploy    | Docker + Docker Compose           |

## Getting Started

### Prerequisites
- Node.js 20+ (frontend)
- Go 1.21+ (backend development) - Pre-built binary included
- Docker & Docker Compose
- PostgreSQL 16+

### 1. Clone & setup env
```bash
git clone https://github.com/<you>/canopiq.git
cd canopiq
cp .env.example .env
# Fill in your GEMINI_API_KEY and DB credentials
```

### 2. Run with Docker
```bash
docker-compose up --build
```

### 3. Or run locally

**Backend:**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Phase Roadmap

- [x] **Phase 1** — Core: photo upload, AI diagnosis, plant diary
- [ ] **Phase 2** — Multi-plant profiles & persistent diary
- [ ] **Phase 3** — Health trend charts + care reminders
- [ ] **Phase 4** — PWA / mobile camera API
- [ ] **Phase 5** — Auth + cloud sync

## Contributing

This repo is structured for a solo tech lead. See `docs/ARCHITECTURE.md` for design decisions.
