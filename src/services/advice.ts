import type { EvaluationInput, Language, Stage } from "../types/poker.js";

export function getAssessment(ehs: number, language: Language = "en"): string {
  if (ehs < 0.3) {
    return language === "de" ? "Außenseiter" : "Underdog";
  }
  if (ehs < 0.5) {
    return language === "de" ? "Hinten, aber spielbar" : "Behind but Playable";
  }
  if (ehs < 0.7) {
    return language === "de" ? "Favorit" : "Favourite";
  }
  return language === "de" ? "Starker Favorit" : "Strong Favourite";
}

export function generateAdvice(
  input: EvaluationInput,
  stage: Stage,
  ehs: number,
  language: Language = "en",
): string {
  const assessmentKey = getAssessment(ehs, "en");

  if (language === "de") {
    const boardNote =
      stage === "preflop"
        ? "Pre-Flop-Equity wird mit deterministischem Monte Carlo geschätzt."
        : "Post-Flop-Equity nutzt exakte Board-Aufzählung.";

    if (assessmentKey === "Underdog") {
      return `${boardNote} Du liegst gegen die meisten zufälligen gegnerischen Hände hinten. Spiele nur weiter, wenn der Preis oder ein taktischer Grund klar passt.`;
    }

    if (assessmentKey === "Behind but Playable") {
      return `${boardNote} Du hast relevante Equity, bleibst aber anfällig. Spiele vorsichtig gegen Druck.`;
    }

    if (assessmentKey === "Favourite") {
      return `${boardNote} Du liegst gegen viele zufällige gegnerische Hände vorne. Value und Schutz sind beide wichtig.`;
    }

    return `${boardNote} Diese Hand ist gegen eine zufällige gegnerische Hand ein starker Favorit. Bevorzuge klare Value-Lines.`;
  }

  const boardNote =
    stage === "preflop"
      ? "Pre-flop equity is estimated with deterministic Monte Carlo."
      : "Post-flop equity uses exact board enumeration.";

  if (assessmentKey === "Underdog") {
    return `${boardNote} You are behind most random opponent holdings. Continue only with a clear price or tactical reason.`;
  }

  if (assessmentKey === "Behind but Playable") {
    return `${boardNote} You have meaningful equity but remain vulnerable. Proceed cautiously against pressure.`;
  }

  if (assessmentKey === "Favourite") {
    return `${boardNote} You are ahead of many random opponent holdings. Value and protection both matter.`;
  }

  return `${boardNote} This hand is a strong favourite against a random opponent. Favor assertive value lines.`;
}
