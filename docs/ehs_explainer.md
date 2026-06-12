# EHS – Effective Hand Strength in Texas Hold'em

## What is EHS?

**Effective Hand Strength (EHS)** is a metric used in Texas Hold'em poker to estimate the overall winning probability of a hand, taking into account both its current strength and its potential to improve (or deteriorate) as future community cards are revealed.

---

## EHS vs. HS – What's the Difference?

| Metric | Description |
|---|---|
| **HS** (Hand Strength) | The probability of winning *right now*, based on the current board state |
| **EHS** (Effective Hand Strength) | HS adjusted for *future potential* — both positive (draws) and negative (opponent improvements) |

Both values are expressed as a decimal between **0 and 1**, equivalent to a percentage:
- `EHS = 0.65` means the hand wins in approximately **65% of cases** at showdown
- `EHS = 1.0` = unbeatable hand; `EHS = 0.0` = loses against everything

---

## The Formula

```
EHS = HS × (1 - NPot) + (1 - HS) × PPot
```

| Variable | Name | Meaning |
|---|---|---|
| `HS` | Hand Strength | Current win probability against a random opponent hand |
| `PPot` | Positive Potential | Probability of improving to a winning hand on future streets |
| `NPot` | Negative Potential | Probability of currently winning but losing after future cards |

---

## Example

Given:
- **Hole Cards:** T♣ 9♠
- **Flop:** T♠ 4♥ 5♥ (Top Pair + Open-Ended Straight Draw)

```
HS   ≈ 0.62  (Top Pair Tens beats ~62% of random hands)
PPot ≈ 0.28  (Straight draw + trip/two-pair outs)
NPot ≈ 0.12  (Flush draw on board works against us)

EHS = 0.62 × (1 - 0.12) + (1 - 0.62) × 0.28
    = 0.62 × 0.88 + 0.38 × 0.28
    = 0.546 + 0.106
    ≈ 0.65
```

**Interpretation:** This hand wins ~65% of the time by showdown, factoring in all possible Turn and River cards.

---

## Important Caveats

EHS assumes play against a **random hand range** and that **all cards are dealt to showdown**. In practice:

1. **Opponent range matters** — real opponents don't play random hands; adjust EHS based on their perceived range (tight, loose, aggressive, etc.)
2. **Showdown assumption** — EHS ignores fold equity; winning before showdown through betting/bluffing is not captured
3. **Use as a baseline** — EHS is a solid starting framework, but range-based thinking and positional awareness are required for accurate in-game decisions

---

## Summary

> EHS gives you a single number representing your hand's true winning probability across all future board runouts — a more complete picture than raw hand strength alone. Use it as a decision-making anchor, not a definitive answer.
