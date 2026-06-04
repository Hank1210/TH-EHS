export const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"] as const;
export const SUITS = ["s", "h", "d", "c"] as const;

export type Rank = (typeof RANKS)[number];
export type Suit = (typeof SUITS)[number];
export type CardCode = `${Rank}${Suit}`;
export type Stage = "preflop" | "flop" | "turn" | "river";
export type HandState = "ahead" | "tied" | "behind";

export interface VisionResult {
  holeCards: string[];
  boardCards: string[];
  confidence: number;
}

export interface EHSResult {
  hs: number;
  ppot: number;
  npot: number;
  ehs: number;
}

export interface EvaluationInput {
  holeCards: CardCode[];
  boardCards: CardCode[];
}

export interface EvaluationResult {
  stage: Stage;
  holeCards: CardCode[];
  boardCards: CardCode[];
  hs: number;
  ppot: number;
  npot: number;
  ehs: number;
  assessment: string;
  advice: string;
}
