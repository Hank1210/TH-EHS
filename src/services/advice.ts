import type { EvaluationInput, Stage } from "../types/poker.js";

export function getAssessment(ehs: number): string {
  if (ehs < 0.3) {
    return "Underdog";
  }
  if (ehs < 0.5) {
    return "Behind but Playable";
  }
  if (ehs < 0.7) {
    return "Favourite";
  }
  return "Strong Favourite";
}

export function generateAdvice(input: EvaluationInput, stage: Stage, ehs: number): string {
  const assessment = getAssessment(ehs);
  const boardNote = stage === "preflop" ? "Pre-flop equity is estimated with deterministic Monte Carlo." : "Post-flop equity uses exact board enumeration.";

  if (assessment === "Underdog") {
    return `${boardNote} You are behind most random opponent holdings. Continue only with a clear price or tactical reason.`;
  }

  if (assessment === "Behind but Playable") {
    return `${boardNote} You have meaningful equity but remain vulnerable. Proceed cautiously against pressure.`;
  }

  if (assessment === "Favourite") {
    return `${boardNote} You are ahead of many random opponent holdings. Value and protection both matter.`;
  }

  return `${boardNote} This hand is a strong favourite against a random opponent. Favor assertive value lines.`;
}
