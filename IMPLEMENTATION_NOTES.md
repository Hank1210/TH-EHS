# IMPLEMENTATION_NOTES.md

# TH-EHS2 Implementation Notes

Version: 1.0

Purpose: Technical implementation guidance for Codex.

---

# Design Principles

## Principle 1

Use AI only for card recognition.

Never use AI for:

* EHS calculation
* Poker equity calculation
* Hand ranking
* Advice logic

All poker calculations must be deterministic code.

---

## Principle 2

Same input must always produce same output.

Example:

```text
Hole Cards:
As Ks

Board:
8h 7h 7s
```

Must always return the same:

```text
HS
PPOT
NPOT
EHS
```

independent of execution time.

---

## Principle 3

Stateless Architecture

Do not store:

* Images
* Hands
* Users
* Results

The complete request lifecycle should be:

```text
Receive Image
    ↓
Process
    ↓
Reply
    ↓
Discard Memory
```

---

# Recommended NPM Packages

## Required

Install:

```bash
npm install openai
npm install pokersolver
npm install dotenv
npm install zod
npm install axios
```

---

## Development

```bash
npm install -D typescript
npm install -D vitest
npm install -D eslint
npm install -D prettier
npm install -D @types/node
```

---

# Why PokerSolver?

PokerSolver provides:

* Hand ranking
* Hand comparison
* Texas Hold'em support

Example:

```typescript
import { Hand } from "pokersolver";

const player = Hand.solve([
  "As",
  "Ks",
  "8h",
  "7h",
  "7s"
]);

const villain = Hand.solve([
  "Ad",
  "Ac",
  "8h",
  "7h",
  "7s"
]);

const winner = Hand.winners([
  player,
  villain
]);
```

PokerSolver handles ranking.

TH-EHS2 handles probability calculations.

---

# EHS Algorithm Strategy

Reference:

https://en.wikipedia.org/wiki/Effective_hand_strength_algorithm

Formula:

```text
EHS = HS × (1 − NPOT) + (1 − HS) × PPOT
```

---

# Stage-Specific Implementation

## River

Simplest stage.

Known:

* Hole cards
* Board cards

Unknown:

* Opponent cards only

Algorithm:

```text
Generate all opponent hands

Compare

Ahead
Tied
Behind
```

Then:

```text
HS = (Ahead + Tied/2)
     /
     Total
```

River:

```text
PPOT = 0
NPOT = 0
EHS = HS
```

---

## Turn

Known:

* Hole cards
* Board cards
* One future river card

Algorithm:

```text
For each opponent hand

    For each possible river card

        Evaluate result
```

Generate:

```text
HP Matrix
```

Calculate:

```text
HS
PPOT
NPOT
EHS
```

---

## Flop

Known:

* Hole cards
* Board cards

Unknown:

* Turn
* River

Algorithm:

```text
For each opponent hand

    For each turn card

        For each river card

            Evaluate
```

This is the most expensive stage.

---

## Pre-Flop

Full enumeration is expensive.

Use Monte Carlo.

Recommended:

```text
50,000 simulations
```

Minimum:

```text
10,000 simulations
```

Preferred:

```text
100,000 simulations
```

if runtime permits.

---

# Effective Hand Strength Matrix

Use classic EHS matrix:

```text
HP[ahead][ahead]
HP[ahead][tied]
HP[ahead][behind]

HP[tied][ahead]
HP[tied][tied]
HP[tied][behind]

HP[behind][ahead]
HP[behind][tied]
HP[behind][behind]
```

---

# PPOT Calculation

```text
PPOT =
(
HP[behind][ahead]
+
HP[behind][tied] / 2
+
HP[tied][ahead] / 2
)
/
(totalBehind + totalTied)
```

---

# NPOT Calculation

```text
NPOT =
(
HP[ahead][behind]
+
HP[tied][behind] / 2
+
HP[ahead][tied] / 2
)
/
(totalAhead + totalTied)
```

---

# Opponent Assumption

Version 1:

Assume:

```text
1 random opponent
```

Reason:

* Simpler
* Faster
* Matches standard EHS formulation

Future versions may support:

```text
2 players
3 players
N players
```

---

# Vision Model Recommendations

## Preferred

OpenAI GPT-4.1

Reason:

* Reliable JSON
* Fast
* Good card recognition

---

## Alternative

Claude Sonnet

Reason:

* Strong image understanding

---

# Confidence Threshold

Accept result only if:

```text
confidence >= 0.85
```

Otherwise:

```text
unclear_cards
```

---

# Card Format Standard

Internally:

```text
As
Ah
Ad
Ac

Ks
Kh
Kd
Kc
```

Ranks:

```text
A
K
Q
J
T
9
8
7
6
5
4
3
2
```

Suits:

```text
s
h
d
c
```

Never use Unicode suits internally.

---

# Telegram Formatting

Internal:

```text
As
Ks
```

Output:

```text
A♠
K♠
```

Create utility:

```typescript
formatCard(card)
```

---

# Error Handling

## Vision Failure

```text
I could not identify all cards clearly.
Please retake the photo.
```

---

## Duplicate Cards

```text
Duplicate cards detected.
```

---

## Invalid Board Size

```text
Board must contain 0, 3, 4, or 5 cards.
```

---

## Timeout

```text
The evaluation is taking too long.
Please try again.
```

---

# Performance Optimizations

## Cache Deck

Do not recreate deck every request.

Create once:

```typescript
const FULL_DECK = [...]
```

---

## Reuse Card Objects

Avoid excessive object creation.

Use immutable card structures.

---

## Parallel Opponent Evaluation

For large simulations:

```typescript
Promise.all()
```

where appropriate.

---

# Recommended Type Definitions

```typescript
export interface VisionResult {
  holeCards: string[];
  boardCards: string[];
  confidence: number;
}
```

```typescript
export interface EHSResult {
  hs: number;
  ppot: number;
  npot: number;
  ehs: number;
}
```

```typescript
export interface EvaluationResult {
  stage: "preflop" | "flop" | "turn" | "river";
  ehs: EHSResult;
  advice: string;
}
```

---

# Unit Test Cases

## Test 1

```text
As Ks
```

Expected:

```text
Pre-Flop
```

---

## Test 2

```text
As Ks
8h 7h 7s
```

Expected:

```text
Flop
```

---

## Test 3

```text
As Ks
8h 7h 7s Ah
```

Expected:

```text
Turn
```

---

## Test 4

```text
As Ks
8h 7h 7s Ah 3c
```

Expected:

```text
River
```

---

## Test 5

Duplicate card:

```text
As Ks
As 7h 7s
```

Expected:

```text
Validation Error
```

---

# Vercel Configuration

Create:

```json
{
  "functions": {
    "src/api/telegram.ts": {
      "maxDuration": 30
    }
  }
}
```

Reason:

Large Monte Carlo simulations may exceed default limits.

---

# Production Readiness Checklist

* Telegram webhook working
* OpenAI Vision working
* Card validation working
* EHS deterministic
* Unit tests passing
* Response time <15 seconds
* Environment variables configured
* Vercel deployment successful

---

# Final Rule

The Vision Model identifies cards.

The Poker Engine determines outcomes.

Never allow the LLM to calculate poker probabilities.
