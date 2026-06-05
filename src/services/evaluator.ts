import { loadEnv, type AppEnv } from "../config/env.js";
import { calculateEhs } from "../poker/effectiveHandStrength.js";
import { detectStage, validateVisionResult } from "./cardValidator.js";
import { generateAdvice, getAssessment } from "./advice.js";
import { formatEvaluation } from "./formatter.js";
import { recognizeCards } from "./vision.js";
import type { Language } from "../types/poker.js";

export async function evaluateImage(
  image: Buffer,
  env: AppEnv = loadEnv(),
  language: Language = "en",
): Promise<string> {
  const visionResult = await recognizeCards(image, {
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL,
  });
  const validated = validateVisionResult(visionResult);
  const stage = detectStage(validated.boardCards);
  const ehs = calculateEhs(
    validated.holeCards,
    validated.boardCards,
    env.MONTE_CARLO_ITERATIONS,
  );
  const assessment = getAssessment(ehs.ehs, language);
  const advice = generateAdvice(
    { holeCards: validated.holeCards, boardCards: validated.boardCards },
    stage,
    ehs.ehs,
    language,
  );

  return formatEvaluation(
    {
      stage,
      holeCards: validated.holeCards,
      boardCards: validated.boardCards,
      hs: ehs.hs,
      ppot: ehs.ppot,
      npot: ehs.npot,
      ehs: ehs.ehs,
      assessment,
      advice,
    },
    language,
  );
}
