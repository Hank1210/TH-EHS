import { RANKS, SUITS, type CardCode, type Stage, type VisionResult } from "../types/poker.js";

const VALID_RANKS = new Set<string>(RANKS);
const VALID_SUITS = new Set<string>(SUITS);
const VALID_BOARD_COUNTS = new Set([0, 3, 4, 5]);

export class CardValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CardValidationError";
  }
}

export function normalizeCard(raw: string): CardCode {
  const card = raw.trim();
  if (card.length !== 2) {
    throw new CardValidationError(`Invalid card format: ${raw}`);
  }

  const rank = card[0]?.toUpperCase();
  const suit = card[1]?.toLowerCase();

  if (!rank || !VALID_RANKS.has(rank) || !suit || !VALID_SUITS.has(suit)) {
    throw new CardValidationError(`Invalid card: ${raw}`);
  }

  return `${rank}${suit}` as CardCode;
}

export function detectStage(boardCards: readonly CardCode[]): Stage {
  switch (boardCards.length) {
    case 0:
      return "preflop";
    case 3:
      return "flop";
    case 4:
      return "turn";
    case 5:
      return "river";
    default:
      throw new CardValidationError("Board must contain 0, 3, 4, or 5 cards.");
  }
}

export function validateVisionResult(result: VisionResult): { holeCards: CardCode[]; boardCards: CardCode[]; stage: Stage } {
  if (result.confidence < 0.85) {
    throw new CardValidationError("I could not confidently identify all cards. Please retake the photo.");
  }

  const holeCards = result.holeCards.map(normalizeCard);
  const boardCards = result.boardCards.map(normalizeCard);

  if (holeCards.length !== 2) {
    throw new CardValidationError("I could not confidently identify all cards. Please retake the photo.");
  }

  if (!VALID_BOARD_COUNTS.has(boardCards.length)) {
    throw new CardValidationError("Board must contain 0, 3, 4, or 5 cards.");
  }

  const allCards = [...holeCards, ...boardCards];
  if (new Set(allCards).size !== allCards.length) {
    throw new CardValidationError("Duplicate cards detected.");
  }

  return { holeCards, boardCards, stage: detectStage(boardCards) };
}
