# Rules Engine — Authoring Guide

## Overview

The KisanSahay rules engine uses **deterministic JSON rules** to evaluate farmer eligibility for government schemes. Rules are decoupled from application code and can be edited independently.

## File Structure

- `schemes.json` — Contains all scheme definitions and their eligibility conditions
- `schema.json` — JSON Schema that validates the structure of `schemes.json`

## Adding a New Scheme

Add an entry to the `schemes` array in `schemes.json`:

```json
{
  "scheme_id": "unique-scheme-id",
  "name": "Scheme Name (English)",
  "name_hi": "योजना का नाम (हिंदी)",
  "name_mr": "योजनेचे नाव (मराठी)",
  "description": "Brief description of the scheme",
  "benefits": "What the farmer receives",
  "conditions": [
    { "field": "farm.land_size", "operator": "in", "value": ["below_1_acre", "1_to_2_acres"] },
    { "field": "credentials.has_aadhaar", "operator": "exists", "value": true }
  ]
}
```

## Available Fields

| Field Path | Type | Valid Values |
|---|---|---|
| `location.state` | string | Any Indian state name |
| `location.district` | string | Any district name |
| `farm.land_ownership` | enum | `own`, `leased` |
| `farm.land_size` | enum | `below_1_acre`, `1_to_2_acres`, `2_to_5_acres`, `above_5_acres` |
| `farm.primary_crop` | enum | `cotton`, `sugarcane`, `wheat`, `rice`, `soybean`, `other` |
| `farm.irrigation_method` | enum | `rainfed`, `well`, `canal` |
| `credentials.category` | enum | `general`, `obc`, `sc`, `st` |
| `credentials.gender` | enum | `male`, `female`, `other` |
| `credentials.has_aadhaar` | boolean | `true`/`false` |
| `credentials.has_bank_account` | boolean | `true`/`false` |
| `credentials.has_ration_card` | boolean | `true`/`false` |

## Operators

| Operator | Description | Example |
|---|---|---|
| `eq` | Exact match | `{"field": "farm.land_ownership", "operator": "eq", "value": "own"}` |
| `in` | Value is in list | `{"field": "farm.land_size", "operator": "in", "value": ["below_1_acre", "1_to_2_acres"]}` |
| `not_in` | Value is NOT in list | `{"field": "credentials.category", "operator": "not_in", "value": ["general"]}` |
| `exists` | Field is truthy | `{"field": "credentials.has_aadhaar", "operator": "exists", "value": true}` |

## Evaluation Logic

- **AND logic**: ALL conditions in a scheme must be met for the farmer to be eligible
- **Match score**: Calculated as `(conditions met) / (total conditions)` — ranges from 0.0 to 1.0
