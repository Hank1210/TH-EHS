import type { CardCode, EHSResult, HandState } from "../types/poker.js";
import { combinations, remainingDeck } from "./deck.js";
import { compareHands, handStrengthFromCounts } from "./handStrength.js";
import { preflopEhs } from "./montecarlo.js";

type Matrix = Record<HandState, Record<HandState, number>>;

const STATES: HandState[] = ["ahead", "tied", "behind"];

export function calculateEhs(holeCards: readonly CardCode[], boardCards: readonly CardCode[], monteCarloIterations: number): EHSResult {
  if (boardCards.length === 0) {
    return normalizeResult(preflopEhs(holeCards, monteCarloIterations));
  }

  if (boardCards.length === 5) {
    return normalizeResult(calculateRiverEhs(holeCards, boardCards));
  }

  if (boardCards.length === 3 || boardCards.length === 4) {
    return normalizeResult(calculatePostflopEhs(holeCards, boardCards));
  }

  throw new Error("Board must contain 0, 3, 4, or 5 cards.");
}

function calculateRiverEhs(holeCards: readonly CardCode[], boardCards: readonly CardCode[]): EHSResult {
  const opponentHands = combinations(remainingDeck([...holeCards, ...boardCards]), 2) as CardCode[][];
  let ahead = 0;
  let tied = 0;
  let behind = 0;

  for (const opponent of opponentHands) {
    const state = compareHands(holeCards, opponent, boardCards);
    if (state === "ahead") {
      ahead += 1;
    } else if (state === "tied") {
      tied += 1;
    } else {
      behind += 1;
    }
  }

  const hs = handStrengthFromCounts(ahead, tied, behind);
  return { hs, ppot: 0, npot: 0, ehs: hs };
}

function calculatePostflopEhs(holeCards: readonly CardCode[], boardCards: readonly CardCode[]): EHSResult {
  const matrix = createMatrix();
  const currentCounts: Record<HandState, number> = { ahead: 0, tied: 0, behind: 0 };
  const opponentHands = combinations(remainingDeck([...holeCards, ...boardCards]), 2) as CardCode[][];
  const futureCardCount = 5 - boardCards.length;

  for (const opponent of opponentHands) {
    const initial = compareHands(holeCards, opponent, boardCards);
    currentCounts[initial] += 1;

    const futureDeck = remainingDeck([...holeCards, ...boardCards, ...opponent]);
    const futureBoards = combinations(futureDeck, futureCardCount) as CardCode[][];

    for (const futureCards of futureBoards) {
      const final = compareHands(holeCards, opponent, [...boardCards, ...futureCards]);
      matrix[initial][final] += 1;
    }
  }

  const hs = handStrengthFromCounts(currentCounts.ahead, currentCounts.tied, currentCounts.behind);
  const totalBehind = sumState(matrix.behind);
  const totalTied = sumState(matrix.tied);
  const totalAhead = sumState(matrix.ahead);

  const ppotDenominator = totalBehind + totalTied;
  const npotDenominator = totalAhead + totalTied;

  const ppot =
    ppotDenominator === 0
      ? 0
      : (matrix.behind.ahead + matrix.behind.tied / 2 + matrix.tied.ahead / 2) / ppotDenominator;

  const npot =
    npotDenominator === 0
      ? 0
      : (matrix.ahead.behind + matrix.tied.behind / 2 + matrix.ahead.tied / 2) / npotDenominator;

  const ehs = hs * (1 - npot) + (1 - hs) * ppot;

  return { hs, ppot, npot, ehs };
}

function createMatrix(): Matrix {
  return {
    ahead: { ahead: 0, tied: 0, behind: 0 },
    tied: { ahead: 0, tied: 0, behind: 0 },
    behind: { ahead: 0, tied: 0, behind: 0 }
  };
}

function sumState(row: Record<HandState, number>): number {
  return STATES.reduce((total, state) => total + row[state], 0);
}

function normalizeResult(result: EHSResult): EHSResult {
  return {
    hs: clampProbability(result.hs),
    ppot: clampProbability(result.ppot),
    npot: clampProbability(result.npot),
    ehs: clampProbability(result.ehs)
  };
}

function clampProbability(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}
