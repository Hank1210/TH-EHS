import { describe, expect, it } from "vitest";
import { detectStage, validateVisionResult } from "../src/services/cardValidator.js";

describe("card validation", () => {
  it("detects stages", () => {
    expect(detectStage([])).toBe("preflop");
    expect(detectStage(["8h", "7h", "7s"])).toBe("flop");
    expect(detectStage(["8h", "7h", "7s", "Ah"])).toBe("turn");
    expect(detectStage(["8h", "7h", "7s", "Ah", "3c"])).toBe("river");
  });

  it("rejects duplicate cards", () => {
    expect(() =>
      validateVisionResult({
        holeCards: ["As", "Ks"],
        boardCards: ["As", "7h", "7s"],
        confidence: 0.98
      })
    ).toThrow("Duplicate cards detected.");
  });

  it("rejects low confidence", () => {
    expect(() =>
      validateVisionResult({
        holeCards: ["As", "Ks"],
        boardCards: [],
        confidence: 0.5
      })
    ).toThrow("retake");
  });
});
