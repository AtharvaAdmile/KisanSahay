# CLAUDE.md — KisanSahay Development Rules

## Accessibility (MANDATORY)

- **Touch targets**: All interactive elements MUST be ≥ 48×48dp (preferably 64×64dp for primary actions)
- **Font sizes**: Minimum 16sp for body text, 20sp for labels, 24sp for headers
- **Color palette** (earthy, high-contrast):
  - Primary Brown: `#5C4033`
  - Warm Brown: `#8B7355`
  - Cream Background: `#F5F0E1`
  - Success Green: `#2E7D32`
  - Action Amber: `#FF8F00`
  - Error Red: `#C62828`
  - Text on Light: `#1B1B1B`
  - Text on Dark: `#FAFAFA`
- **Contrast ratios**: All text must meet WCAG AA (4.5:1 for normal text, 3:1 for large text)
- **Iconography over text**: Prefer icons/illustrations to communicate concepts. Every icon MUST have an accessible label
- **No small checkboxes or radio buttons**: Use `BigToggle` or `IconCard` components

## Localization (MANDATORY)

- **Supported languages**: Hindi (`hi`), Marathi (`mr`), English (`en`)
- **No hardcoded user-facing strings**: All display text MUST go through the `i18n` system (`useTranslation()` hook)
- **Translation files**: `/frontend/src/i18n/{en,hi,mr}.json`
- **RTL considerations**: Not required for Hindi/Marathi (both LTR scripts)
- **Number formatting**: Use locale-aware formatting for land sizes, currency

## Python Backend Rules

- **Type hints**: Every function MUST have full type annotations (parameters + return type)
- **Pydantic**: All request/response schemas MUST use `pydantic.BaseModel` with:
  - `from __future__ import annotations`
  - Field validators where applicable
  - `model_config = ConfigDict(strict=True)` for input validation
- **Async-first**: All database operations MUST use async/await
- **Error handling**: Use FastAPI's `HTTPException` with meaningful error codes and messages in English

## Offline-First Design

- **Local state first**: All form data MUST be persisted to `AsyncStorage` before any network call
- **Screens must render without network**: No blocking API calls during initial render
- **Sync later**: Queue API submissions and sync when connectivity is available
- **Graceful degradation**: Show meaningful fallback UI if data cannot be loaded

## Rules Engine

- **Deterministic**: The JSON rules engine MUST produce identical outputs for identical inputs
- **Decoupled**: Rules JSON files live in `/rules/` — never inline rule logic in application code
- **Versioned**: Each rule set must have a `version` field
- **Validated**: All rules must conform to `/rules/schema.json`
