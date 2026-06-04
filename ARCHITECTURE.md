# ARCHITECTURE.md

# TH-EHS2 Architecture

## System Overview

TH-EHS2 is a serverless Telegram poker evaluator running on Vercel.

The application consists of:

1. Telegram Integration Layer
2. Vision Layer
3. Poker Calculation Layer
4. Advice Layer
5. Response Layer

---

# Data Flow

```text
Telegram User
      │
      ▼
Telegram Bot
      │
      ▼
Webhook Endpoint
      │
      ▼
Image Download
      │
      ▼
Vision Recognition
      │
      ▼
Card Validation
      │
      ▼
Poker Engine
      │
      ▼
Advice Engine
      │
      ▼
Telegram Response
```

---

# Component Design

## Telegram Layer

Responsibilities:

* Receive webhook
* Download image
* Send response

File:

```text
src/services/telegram.ts
```

Functions:

```typescript
downloadImage(fileId)

sendMessage(chatId, message)

verifyWebhook(headers)
```

---

# Vision Layer

Responsibilities:

* Read cards from image
* Return structured JSON

File:

```text
src/services/vision.ts
```

Interface:

```typescript
interface VisionResult {
  holeCards: string[];
  boardCards: string[];
  confidence: number;
}
```

Example:

```json
{
  "holeCards": ["As","Ks"],
  "boardCards": ["8h","7h","7s"],
  "confidence": 0.98
}
```

---

# Validation Layer

Responsibilities:

* Verify cards
* Prevent duplicates
* Verify stage

File:

```text
src/services/cardValidator.ts
```

Validation Rules:

* No duplicate cards
* Two hole cards required
* Board cards must be 0,3,4,5

---

# Poker Engine

## Card Model

```typescript
type Rank =
  | "A"
  | "K"
  | "Q"
  | "J"
  | "T"
  | "9"
  | "8"
  | "7"
  | "6"
  | "5"
  | "4"
  | "3"
  | "2";

type Suit =
  | "s"
  | "h"
  | "d"
  | "c";

interface Card {
  rank: Rank;
  suit: Suit;
}
```

---

# Hand Strength Engine

Responsibilities:

Calculate current equity.

File:

```text
src/poker/handStrength.ts
```

Output:

```typescript
interface HandStrengthResult {
  ahead: number;
  tied: number;
  behind: number;
  hs: number;
}
```

---

# Monte Carlo Engine

Responsibilities:

Generate simulations.

File:

```text
src/poker/montecarlo.ts
```

Configuration:

```typescript
iterations = 50000
```

Outputs:

```typescript
interface MonteCarloResult {
  wins: number;
  losses: number;
  ties: number;
}
```

---

# EHS Engine

File:

```text
src/poker/effectiveHandStrength.ts
```

Outputs:

```typescript
interface EHSResult {
  hs: number;
  ppot: number;
  npot: number;
  ehs: number;
}
```

Formula:

```text
EHS = HS × (1 − NPOT) + (1 − HS) × PPOT
```

---

# Advice Engine

Responsibilities:

Convert probabilities into poker advice.

File:

```text
src/services/advice.ts
```

Example:

```typescript
generateAdvice(ehsResult)
```

Output:

```text
Strong Favourite

Top pair with strong kicker.
```

---

# Error Handling

## Vision Failure

Return:

```text
I could not identify all cards clearly.
```

---

## Invalid Cards

Return:

```text
Duplicate cards detected.
```

---

## Telegram Failure

Return:

```text
Unable to send response.
```

---

# Performance Targets

| Metric             | Target  |
| ------------------ | ------- |
| Vision Recognition | <5 sec  |
| EHS Calculation    | <5 sec  |
| Telegram Reply     | <2 sec  |
| Total Response     | <15 sec |

---

# Security

## Secrets

Store only in:

```env
TELEGRAM_BOT_TOKEN=
OPENAI_API_KEY=
TELEGRAM_WEBHOOK_SECRET=
```

Never commit secrets.

---

# Deployment

## Environment

Vercel

## Runtime

Node.js 22

## Region

Frankfurt (preferred)

---

# Future Architecture

Future versions may add:

* PostgreSQL
* Session history
* Hand replay
* EV calculations
* Multi-player support
* GTO analysis

Current MVP remains stateless.
