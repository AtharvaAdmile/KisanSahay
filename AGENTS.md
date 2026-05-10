# AGENTS.md — KisanSahay Agent Instructions

## Project Overview

KisanSahay is a full-stack agritech application that helps Indian farmers discover eligible government schemes through a mobile-first onboarding flow.

## Setup Commands

### Backend (Python/FastAPI)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Frontend (React Native/Expo)
```bash
cd frontend
npm install
```

### Database
```bash
# Ensure PostgreSQL is running with pgvector extension
psql -U postgres -c "CREATE DATABASE kisansahay;"
psql -U postgres -d kisansahay -f backend/app/db/migrations/001_init.sql
```

## Testing Instructions

### Backend Tests
```bash
cd backend
python -m pytest tests/ -v --tb=short
```

### Frontend Tests
```bash
cd frontend
npx jest --coverage
```

### Linting
```bash
# Python
cd backend && ruff check . && ruff format --check .

# JavaScript/TypeScript
cd frontend && npx prettier --check "src/**/*.{ts,tsx}"
```

## Code Style Conventions

### Python
- Formatter: `ruff format` (88-char line limit)
- Linter: `ruff check`
- Type hints: Required on all functions (params + return)
- Models: Pydantic BaseModel for all schemas
- Imports: `from __future__ import annotations` at top of every file
- Docstrings: Google-style for all public functions

### JavaScript / TypeScript
- Formatter: Prettier (single quotes, trailing commas)
- Components: Functional components with hooks only
- State: Zustand stores with AsyncStorage middleware
- Naming: PascalCase for components, camelCase for functions/variables

### Git Commit Conventions
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation only
- `refactor:` — Code restructure without behavior change
- `test:` — Adding or updating tests
- `chore:` — Build process, dependencies

## Directory Structure
```
KisanSahay/
├── backend/          # FastAPI application
│   ├── app/          # Source code
│   │   ├── api/      # Route handlers
│   │   ├── db/       # Database connection & migrations
│   │   ├── engine/   # Rules engine loader & evaluator
│   │   └── models/   # Pydantic schemas
│   └── tests/        # pytest tests
├── frontend/         # React Native Expo app
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── i18n/        # Localization files
│       ├── navigation/  # React Navigation setup
│       ├── screens/     # Screen components
│       └── store/       # Zustand state stores
└── rules/            # JSON rules engine files
```
