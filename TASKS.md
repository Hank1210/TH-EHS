# TASKS.md

# TH-EHS2 Implementation Plan

## Phase 1 - Project Setup

### Repository

* [ ] Initialize TypeScript project
* [ ] Configure Node.js 22
* [ ] Configure Vercel deployment
* [ ] Create GitHub repository
* [ ] Configure environment variables

### Code Quality

* [ ] ESLint
* [ ] Prettier
* [ ] Husky pre-commit hooks
* [ ] Type checking in CI

### Testing

* [ ] Install Vitest
* [ ] Configure test environment
* [ ] Create test folder structure

---

# Phase 2 - Telegram Integration

## Telegram Service

* [ ] Create Telegram API wrapper
* [ ] Verify webhook secret
* [ ] Download image from Telegram
* [ ] Send text response
* [ ] Send error response

## Webhook Endpoint

File:

```text
src/api/telegram.ts
```

Tasks:

* [ ] Handle POST requests
* [ ] Validate Telegram payload
* [ ] Extract chat id
* [ ] Extract photo id
* [ ] Reject unsupported messages

Acceptance:

* [ ] User sends image
* [ ] Webhook receives image
* [ ] Image downloads successfully

---

# Phase 3 - Vision Integration

## OpenAI Service

File:

```text
src/services/vision.ts
```

Tasks:

* [ ] Connect GPT-4.1 Vision
* [ ] Upload image
* [ ] Parse structured JSON
* [ ] Handle unclear cards

Expected Output

```json
{
  "holeCards": ["As","Ks"],
  "boardCards": ["8h","7h","7s"],
  "confidence": 0.98
}
```

Acceptance:

* [ ] Hole cards identified
* [ ] Board cards identified
* [ ] Confidence returned

---

# Phase 4 - Validation Layer

File:

```text
src/services/cardValidator.ts
```

Tasks:

* [ ] Validate ranks
* [ ] Validate suits
* [ ] Detect duplicates
* [ ] Validate board size
* [ ] Validate hole cards

Acceptance:

* [ ] Invalid hands rejected
* [ ] Duplicate cards rejected

---

# Phase 5 - Poker Engine

## Hand Strength

File:

```text
src/poker/handStrength.ts
```

Tasks:

* [ ] Evaluate current hand
* [ ] Compare against opponent range
* [ ] Calculate HS

Acceptance:

* [ ] HS unit tested

---

## Monte Carlo Engine

File:

```text
src/poker/montecarlo.ts
```

Tasks:

* [ ] Build remaining deck
* [ ] Generate random opponents
* [ ] Simulate outcomes
* [ ] Return probabilities

Acceptance:

* [ ] 50k simulations complete

---

## EHS Engine

File:

```text
src/poker/effectiveHandStrength.ts
```

Tasks:

* [ ] Calculate HS
* [ ] Calculate PPOT
* [ ] Calculate NPOT
* [ ] Calculate EHS

Formula:

```text
EHS = HS * (1 - NPOT) + (1 - HS) * PPOT
```

Acceptance:

* [ ] Results deterministic
* [ ] Results repeatable

---

# Phase 6 - Advice Engine

File:

```text
src/services/advice.ts
```

Tasks:

* [ ] Create EHS buckets
* [ ] Create advice templates
* [ ] Generate final text

Buckets:

| Range     | Label               |
| --------- | ------------------- |
| 0.00-0.29 | Underdog            |
| 0.30-0.49 | Behind but Playable |
| 0.50-0.69 | Favourite           |
| 0.70-1.00 | Strong Favourite    |

Acceptance:

* [ ] Advice generated

---

# Phase 7 - Telegram Response

File:

```text
src/services/formatter.ts
```

Tasks:

* [ ] Format poker output
* [ ] Format percentages
* [ ] Format card display
* [ ] Format advice

Acceptance:

* [ ] Telegram message readable

---

# Phase 8 - Testing

## Unit Tests

* [ ] Card validation
* [ ] Hand strength
* [ ] Monte Carlo
* [ ] EHS calculation

## Integration Tests

* [ ] Telegram webhook
* [ ] Vision response
* [ ] End-to-end evaluation

---

# Phase 9 - Deployment

## Vercel

* [ ] Configure production environment
* [ ] Configure webhook URL
* [ ] Configure secrets

## Acceptance

* [ ] Telegram bot responds
* [ ] Production deployment works
* [ ] Response < 15 seconds

---

# MVP Definition

A successful MVP:

* Accepts Telegram images
* Detects cards
* Calculates EHS
* Returns advice
* Runs on Vercel
* Uses deterministic poker calculations
