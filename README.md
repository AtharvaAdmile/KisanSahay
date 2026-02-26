# 🌾 KisanSahay — Farmer Scheme Eligibility Platform

> Simplifying access to government agricultural schemes for Indian farmers.

## Architecture

```
KisanSahay/
├── backend/          # FastAPI + PostgreSQL/pgvector
│   ├── app/
│   │   ├── api/      # REST endpoints (onboarding, schemes, eligibility)
│   │   ├── models/   # Pydantic models (farmer, scheme)
│   │   ├── db/       # Async SQLAlchemy, migrations, pgvector
│   │   └── engine/   # Deterministic rules evaluator
│   └── tests/        # pytest suite
├── frontend/         # React Native (Expo) mobile app
│   └── src/
│       ├── screens/  # 3-step onboarding flow
│       ├── components/ # IconCard, BigToggle (accessible)
│       ├── store/    # Zustand + AsyncStorage (offline-first)
│       ├── i18n/     # Hindi, Marathi, English
│       └── navigation/
└── rules/            # JSON rules engine
    ├── schemes.json  # 5 real Indian agricultural schemes
    ├── schema.json   # Validation schema
    └── README.md     # Authoring guide
```

## Key Features

- **Offline-First**: All onboarding data persisted locally via AsyncStorage
- **Vernacular**: Full Hindi/Marathi/English support (i18next)
- **Accessible**: 48dp+ touch targets, high-contrast earthy palette, iconography
- **Deterministic**: JSON rules engine evaluates eligibility without LLM
- **Semantic Search**: pgvector-powered scheme discovery (planned)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + Expo |
| Backend | Python FastAPI |
| Database | PostgreSQL + pgvector |
| State | Zustand + AsyncStorage |
| i18n | react-i18next |
| Rules | JSON-based deterministic engine |

## Quick Start

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npx expo start
```

### Run Tests
```bash
cd backend && pytest -v
```

## Schemes Covered

| # | Scheme | Key Criteria |
|---|--------|-------------|
| 1 | PM-KISAN | Land ≤ 2 hectares, Aadhaar + Bank |
| 2 | PMFBY | Any farmer, Aadhaar |
| 3 | Soil Health Card | Any farmer, Aadhaar |
| 4 | RKVY | Any farmer, Aadhaar |
| 5 | Mahatma Phule Shetkari | Maharashtra, Aadhaar + Bank |

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Earth Brown | `#5C4033` | Primary text |
| Warm Tan | `#8B7355` | Secondary text |
| Cream | `#F5F0E1` | Backgrounds |
| Green | `#2E7D32` | CTAs, success |
| Amber | `#FF8F00` | Submit, warnings |

## License

MIT
