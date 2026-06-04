import type { CardCode, EvaluationResult } from "../types/poker.js";

const SUIT_SYMBOLS: Record<string, string> = {
  s: "♠",
  h: "♥",
  d: "♦",
  c: "♣"
};

export function formatCard(card: CardCode): string {
  return `${card[0]}${SUIT_SYMBOLS[card[1] ?? ""] ?? card[1]}`;
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatEvaluation(result: EvaluationResult): string {
  const board = result.boardCards.length > 0 ? result.boardCards.map(formatCard).join(" ") : "None";

  return [
    "TH-EHS Evaluation",
    "",
    `Hole Cards: ${result.holeCards.map(formatCard).join(" ")}`,
    `Board: ${board}`,
    `Stage: ${formatStage(result.stage)}`,
    "",
    `HS: ${formatPercent(result.hs)}`,
    `PPOT: ${formatPercent(result.ppot)}`,
    `NPOT: ${formatPercent(result.npot)}`,
    `EHS: ${formatPercent(result.ehs)}`,
    "",
    `Assessment: ${result.assessment}`,
    `Advice: ${result.advice}`
  ].join("\n");
}

function formatStage(stage: string): string {
  if (stage === "preflop") {
    return "Pre-Flop";
  }
  return `${stage[0]?.toUpperCase() ?? ""}${stage.slice(1)}`;
}
