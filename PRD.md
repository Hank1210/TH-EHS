# PRD.md

# TH-EHS2

## Telegram Poker Hand Evaluator using Effective Hand Strength (EHS)

Version: 1.0

Status: Ready for Implementation

Owner: Frank Euler

Implementation: Codex

Platform: Vercel

Language: TypeScript

Repository: TH-EHS2

---

# 1. Project Overview

TH-EHS2 is a Telegram bot that evaluates Texas Hold'em poker hands from photographs.

The user sends a photo showing:

* Hole cards
* Community cards

The system:

1. Downloads the image from Telegram.
2. Uses a Vision LLM to identify cards.
3. Detects the current game stage.
4. Calculates Effective Hand Strength (EHS).
5. Generates a poker recommendation.
6. Sends the result back to Telegram.

The existing Telegram bot already exists:

TH-EHS2

The application will be hosted on Vercel and developed in VS Code using Codex.

---

# 2. Goals

## Primary Goal

Accurately calculate Effective Hand Strength from a poker hand photo.

## Secondary Goals

* Educational poker feedback
* Fast response times
* Deterministic calculations
* Stateless architecture

## Success Metrics

| Metric                    | Target  |
| ------------------------- | ------- |
| Card Recognition Accuracy | >95%    |
| Successful Evaluations    | >99%    |
| Response Time             | <15 sec |
| EHS Consistency           | 100%    |

---

# 3. High-Level Architecture

```text
Telegram User
      │
      ▼
TH-EHS2 Bot
      │
      ▼
Telegram Webhook
      │
      ▼
Vercel API Route
      │
      ▼
Vision Service
(OpenAI GPT-4.1)
      │
      ▼
Card Extraction
      │
      ▼
EHS Engine
      │
      ▼
Advice Generator
      │
      ▼
Telegram Response
```

---

# 4. Functional Requirements

## FR-1 Telegram Input

Supported:

* Telegram photos
* Telegram image documents

Unsupported:

* Text
* Audio
* Video
* PDFs

Response:

```text
Please send a photo containing your poker cards.
```

---

## FR-2 Card Recognition

Recognize:

### Hole Cards

Exactly two cards.

Examples:

```text
As
Kh
7d
```

### Board Cards

0-5 community cards.

Examples:

```text
8h
7h
7s
```

---

## FR-3 Stage Detection

Determine stage automatically.

| Stage    | Board Cards |
| -------- | ----------- |
| Pre-Flop | 0           |
| Flop     | 3           |
| Turn     | 4           |
| River    | 5           |

---

## FR-4 Card Validation

Reject:

* Duplicate cards
* Ambiguous cards
* Missing hole cards
* Invalid ranks
* Invalid suits

Error message:

```text
I could not confidently identify all cards. Please retake the photo.
```

---

## FR-5 Effective Hand Strength Calculation

Reference:

https://en.wikipedia.org/wiki/Effective_hand_strength_algorithm

Formula:

```text
EHS = HS × (1 − NPOT) + (1 − HS) × PPOT
```

Calculate:

* HS
* PPOT
* NPOT
* EHS

Output values:

```json
{
  "hs": 0.61,
  "ppot": 0.12,
  "npot": 0.04,
  "ehs": 0.64
}
```

---

## FR-6 Poker Evaluation Logic

### Pre-Flop

Use Monte Carlo simulation.

Minimum:

```text
10,000 simulations
```

Preferred:

```text
50,000 simulations
```

---

### Flop

Enumerate:

* all turn cards
* all river cards

Calculate exact EHS.

---

### Turn

Enumerate:

* all possible river cards

Calculate exact EHS.

---

### River

Future cards do not exist.

Set:

```text
PPOT = 0
NPOT = 0
EHS = HS
```

---

## FR-7 Advice Generation

Generate concise educational feedback.

Example:

```text
Top pair with strong kicker.

You are currently ahead of most opponent holdings.
```

Maximum:

```text
3 sentences
```

No long explanations.

---

# 5. Non-Functional Requirements

## Performance

Target:

```text
<15 seconds
```

Maximum:

```text
20 seconds
```

---

## Reliability

```text
99% successful evaluations
```

---

## Scalability

Initial target:

```text
100 evaluations/day
```

Architecture should support:

```text
1000 evaluations/day
```

without redesign.

---

## Privacy

Requirements:

* No image storage
* No database
* Stateless execution
* Memory cleared after request

---

## Security

Requirements:

* Telegram webhook verification
* User allowlist
* Environment variables only
* No secrets in source code

---

# 6. Technical Stack

## Runtime

```text
Node.js 22+
TypeScript
```

## Hosting

```text
Vercel
```

## Vision

Preferred:

```text
OpenAI GPT-4.1
```

Fallback:

```text
Claude Sonnet
```

## Poker Engine

```text
pokersolver
```

Custom:

```text
EHS Engine
Monte Carlo Engine
```

## Testing

```text
Vitest
```

---

# 7. Project Structure

```text
th-ehs2/

├── src
│   ├── api
│   │   └── telegram.ts
│   │
│   ├── services
│   │   ├── telegram.ts
│   │   ├── vision.ts
│   │   ├── ehs.ts
│   │   ├── evaluator.ts
│   │   └── advice.ts
│   │
│   ├── poker
│   │   ├── montecarlo.ts
│   │   ├── enumerator.ts
│   │   ├── handStrength.ts
│   │   └── effectiveHandStrength.ts
│   │
│   ├── prompts
│   │   └── cardRecognition.ts
│   │
│   ├── types
│   │   └── poker.ts
│   │
│   └── utils
│
├── tests
│
├── .env
├── .env.example
├── README.md
├── TASKS.md
├── ARCHITECTURE.md
├── PROMPTS.md
├── package.json
└── vercel.json
```

---

# 8. Environment Variables

## .env.example

```env
TELEGRAM_BOT_TOKEN=

TELEGRAM_WEBHOOK_SECRET=

OPENAI_API_KEY=

OPENAI_MODEL=gpt-4.1

ALLOWED_USER_IDS=

MONTE_CARLO_ITERATIONS=50000

NODE_ENV=production
```

---

# 9. Vision Prompt

System Prompt:

```text
You are a poker card recognition system.

Identify all visible playing cards.

Return ONLY valid JSON.

{
  "holeCards": ["As","Ks"],
  "boardCards": ["8h","7h","7s"],
  "confidence": 0.97
}

If cards are unclear:

{
  "error": "unclear_cards"
}
```

---

# 10. Telegram Output Format

Example:

🃏 TH-EHS Evaluation

Hole Cards:
A♠ K♠

Board:
8♥ 7♥ 7♠

Stage:
Flop

HS:
0.18

PPOT:
0.22

NPOT:
0.05

EHS:
0.32

Assessment:
Behind but playable

Advice:
Paired boards hit many opponent ranges. Proceed cautiously.

---

# 11. Acceptance Criteria

## Test Case 1

Input:

A♠ K♠

Expected:

Pre-Flop detected

---

## Test Case 2

Input:

A♠ K♠ + 8♥ 7♥ 7♠

Expected:

Flop detected

EHS calculated

---

## Test Case 3

Input:

A♠ K♠ + 8♥ 7♥ 7♠ A♥

Expected:

Turn detected

---

## Test Case 4

Input:

A♠ K♠ + 8♥ 7♥ 7♠ A♥ 3♣

Expected:

River detected

PPOT = 0

NPOT = 0

---

## Test Case 5

Input:

Blurry photo

Expected:

Retake request

---

## Test Case 6

Input:

Duplicate card detected

Expected:

Validation error

---

# 12. Codex Implementation Tasks

## Phase 1

Project bootstrap

* Initialize TypeScript project
* Configure Vercel
* Configure ESLint
* Configure Prettier

---

## Phase 2

Telegram integration

* Webhook endpoint
* Download photos
* Validate users

---

## Phase 3

Vision integration

* OpenAI Vision
* Structured JSON output
* Card validation

---

## Phase 4

Poker engine

* Hand evaluator
* Monte Carlo simulation
* EHS implementation

---

## Phase 5

Response generation

* Advice engine
* Telegram formatting

---

## Phase 6

Testing

* Unit tests
* Integration tests
* End-to-end test cases

---

# 13. Future Backlog

* Multi-player support
* Pot odds
* Expected Value (EV)
* Range analysis
* GTO recommendations
* Session tracking
* German language
* Hand history export
* Confidence scores
* Learning mode

---

# IMPORTANT IMPLEMENTATION RULE

Use the Vision model ONLY for card recognition.

Never use the LLM to estimate EHS.

All poker calculations must be deterministic TypeScript code.

The same cards must always produce the same EHS result.
