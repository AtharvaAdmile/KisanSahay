# 🌾 KisanSahay — Farmer Scheme Eligibility Platform

> Simplifying access to government agricultural schemes for Indian farmers.

## Architecture

```
KisanSahay/
├── backend/                  # FastAPI + PostgreSQL/pgvector
│   ├── app/
│   │   ├── api/              # REST endpoints (onboarding, schemes, eligibility)
│   │   ├── models/           # Pydantic models (farmer, scheme)
│   │   ├── db/               # Async SQLAlchemy, migrations, pgvector
│   │   └── engine/           # Deterministic rules evaluator
│   └── tests/                # pytest suite
├── frontend/                 # React Native (Expo SDK 54) mobile app
│   └── src/
│       ├── screens/          # Full app journey (Splash → Home → Detail → Profile)
│       ├── components/       # AppHeader, SchemeCard, FarmSummaryCard, BigToggle, IconCard
│       ├── navigation/       # RootNavigator (React Navigation native stack)
│       ├── store/            # Zustand + AsyncStorage (offline-first)
│       ├── engine/           # Client-side eligibility evaluator
│       ├── data/             # Scheme definitions (icon, color, docs, steps)
│       ├── types/            # TypeScript route param types
│       └── i18n/             # Hindi, Marathi, English translation files
└── rules/                    # JSON rules engine
    ├── schemes.json          # 5 real Indian agricultural schemes
    ├── schema.json           # Validation schema
    └── README.md             # Authoring guide
```

## App Journey

```
Splash (animated logo)
  │
  ├─ First-time user ──► Welcome (language picker + hero)
  │                          │
  └─ Returning user ─────────┤
                             ▼
                      Step 1 — Language & Location
                             │
                      Step 2 — Farm Profile (size, crop, irrigation)
                             │
                      Step 3 — Credentials (category, gender, documents)
                             │
                      Home Dashboard ◄──────────────────────────┐
                       │           │                            │
                  Scheme Card   My Profile ──► Edit Step 1/2/3 ─┘
                       │
                  Scheme Detail
                  (eligibility checklist, how to apply, docs)
```

## Key Features

- **Complete App Journey**: Splash → Welcome → 3-step onboarding → Home dashboard → Scheme detail → Profile editing
- **Offline-First**: All form data persisted locally via AsyncStorage before any network call
- **Vernacular**: Full Hindi / Marathi / English support via react-i18next; language switchable at any time
- **Accessible**: 48dp+ touch targets, 16sp+ fonts, high-contrast earthy palette, icons + labels on all interactive elements
- **Deterministic Eligibility**: JSON rules engine evaluates all 5 schemes client-side — works without internet
- **Per-Scheme Detail**: Eligibility checklist, benefit amount, step-by-step application guide, document status
- **Voice Agent**: Sarvam AI-powered voice assistant for scheme queries (VoiceAgentScreen)
- **Profile Management**: View and edit any onboarding step from the profile screen; reset clears data but preserves language preference
- **Semantic Search**: pgvector-powered scheme discovery (planned)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native 0.81 + Expo SDK 54 |
| Navigation | React Navigation v7 (native stack) |
| Backend | Python FastAPI |
| Database | PostgreSQL + pgvector |
| State | Zustand v5 + AsyncStorage |
| i18n | react-i18next + i18next v25 |
| Rules | JSON-based deterministic engine |
| Voice | Sarvam AI voice agent |

## Screens

| Screen | Description |
|--------|-------------|
| `SplashScreen` | Animated logo; routes to Welcome, resume onboarding, or Home based on store state |
| `WelcomeScreen` | Hero band, language picker, feature highlights, eligibility CTA |
| `PersonalDetailsScreen` | Name, date of birth, mobile, email |
| `LanguageLocationScreen` | Language selector + cascading State → District → Taluka picker |
| `FarmProfileScreen` | Land ownership, size, primary crop, irrigation method (icon cards) |
| `CredentialsScreen` | Category, gender, document possession (BigToggle checkboxes) |
| `HomeScreen` | Eligible count banner, scheme cards split by eligibility, profile link |
| `EligibilityDashboard` | Full eligibility results with scheme breakdown |
| `SchemeDetailScreen` | Colored header band, benefit amount, condition checklist, apply steps, docs |
| `SchemePage` | Scheme listing and browsing |
| `ProfileScreen` | Summary of all onboarding sections with per-section Edit links |
| `UserProfileScreen` | Extended user profile view |
| `VoiceAgentScreen` | Sarvam AI voice assistant for scheme queries |

## Schemes Covered

| # | Scheme | Key Criteria |
|---|--------|-------------|
| 1 | PM-KISAN | Land ≤ 2 hectares, Aadhaar + Bank account |
| 2 | PMFBY | Any farmer, Aadhaar |
| 3 | Soil Health Card | Any farmer (own or leased land), Aadhaar |
| 4 | RKVY | Any farmer, Aadhaar |
| 5 | Mahatma Phule Shetkari | Maharashtra only, land < 5 acres, Aadhaar + Bank |

## Quick Start

### Frontend
```bash
cd frontend
npm install
npx expo start
```

Scan the QR code with Expo Go (Android/iOS) or press `i` for iOS simulator / `a` for Android emulator.

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Run Tests
```bash
cd backend && pytest -v
```

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Primary Brown | `#5C4033` | Headers, titles |
| Warm Brown | `#8B7355` | Secondary text, borders |
| Cream | `#F5F0E1` | All screen backgrounds |
| Success Green | `#2E7D32` | CTAs, eligible chips, progress |
| Action Amber | `#FF8F00` | Submit button, apply CTA |
| Error Red | `#C62828` | Unmet conditions, destructive actions |
| Text Dark | `#1B1B1B` | Body text on light backgrounds |
| Text Light | `#FAFAFA` | Text on dark/colored backgrounds |

## License

MIT
