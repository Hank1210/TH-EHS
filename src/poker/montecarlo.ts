import type { CardCode, EHSResult } from "../types/poker.js";
import { remainingDeck } from "./deck.js";
import { compareHands, handStrengthFromCounts } from "./handStrength.js";
import { createSeededRandom, sampleWithoutReplacement } from "./rng.js";

export interface MonteCarloResult {
  wins: number;
  losses: number;
  ties: number;
  iterations: number;
}

export function runPreflopMonteCarlo(holeCards: readonly CardCode[], iterations: number): MonteCarloResult {
  const deck = remainingDeck(holeCards);
  const random = createSeededRandom(`${holeCards.join("")}:${iterations}`);
  let wins = 0;
  let losses = 0;
  let ties = 0;

  for (let index = 0; index < iterations; index += 1) {
    const sample = sampleWithoutReplacement(deck, 7, random);
    const opponent = sample.slice(0, 2) as CardCode[];
    const board = sample.slice(2, 7) as CardCode[];
    const result = compareHands(holeCards, opponent, board);

    if (result === "ahead") {
      wins += 1;
    } else if (result === "behind") {
      losses += 1;
    } else {
      ties += 1;
    }
  }

  return { wins, losses, ties, iterations };
}

export function preflopEhs(holeCards: readonly CardCode[], iterations: number): EHSResult {
  const result = runPreflopMonteCarlo(holeCards, iterations);
  const hs = handStrengthFromCounts(result.wins, result.ties, result.losses);
  return {
    hs,
    ppot: 0,
    npot: 0,
    ehs: hs
  };
}
