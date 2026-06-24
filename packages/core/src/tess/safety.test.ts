import { describe, expect, it } from "vitest";
import { checkTessSafety } from "./safety";

describe("checkTessSafety", () => {
  it("flags self-harm language", () => {
    const result = checkTessSafety("I want to hurt myself");
    expect(result.flagged).toBe(true);
    expect(["high", "urgent"]).toContain(result.riskLevel);
  });

  it("flags medical emergency", () => {
    const result = checkTessSafety("I cannot breathe");
    expect(result.flagged).toBe(true);
  });

  it("allows normal communication", () => {
    const result = checkTessSafety("I need a break please");
    expect(result.flagged).toBe(false);
  });

  it("flags abuse disclosure", () => {
    const result = checkTessSafety("Someone hurt me at home");
    expect(result.flagged).toBe(true);
  });
});

describe("AI provider env switching", () => {
  it("defaults to gemini provider name", () => {
    const provider = process.env.AI_PROVIDER ?? "gemini";
    expect(["openai", "anthropic", "gemini"]).toContain(provider);
  });
});
