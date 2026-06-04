import { describe, expect, it } from "vitest";
import { FULL_DECK, remainingDeck } from "../src/poker/deck.js";
import { calculateEhs } from "../src/poker/effectiveHandStrength.js";
import { runPreflopMonteCarlo } from "../src/poker/montecarlo.js";

describe("poker engine", () => {
  it("generates a 52-card deck", () => {
    expect(FULL_DECK).toHaveLength(52);
    expect(new Set(FULL_DECK).size).toBe(52);
    expect(remainingDeck(["As", "Ks"])).toHaveLength(50);
  });

  it("keeps preflop Monte Carlo deterministic", () => {
    const first = runPreflopMonteCarlo(["As", "Ks"], 10000);
    const second = runPreflopMonteCarlo(["As", "Ks"], 10000);
    expect(first).toEqual(second);
  });

  it("sets PPOT and NPOT to zero on the river", () => {
    const result = calculateEhs(["As", "Ks"], ["8h", "7h", "7s", "Ah", "3c"], 10000);
    expect(result.ppot).toBe(0);
    expect(result.npot).toBe(0);
    expect(result.ehs).toBe(result.hs);
    expect(result.hs).toBeGreaterThanOrEqual(0);
    expect(result.hs).toBeLessThanOrEqual(1);
  });
});
