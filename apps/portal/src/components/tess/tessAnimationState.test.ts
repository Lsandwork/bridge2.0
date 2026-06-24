import { describe, expect, it } from "vitest";
import {
  quickActionTessState,
  resolveTessState,
  speakingVisualDurationMs,
  COMFORTING_QUICK_IDS,
  CELEBRATING_QUICK_IDS,
} from "./tessAnimationState";

describe("resolveTessState", () => {
  it("prioritizes override", () => {
    expect(
      resolveTessState({
        override: "comforting",
        isWaving: true,
        isRecording: true,
        isThinking: true,
        isSpeaking: true,
        hasInput: true,
        isTalkMode: true,
      })
    ).toBe("comforting");
  });

  it("returns typing when user has input", () => {
    expect(
      resolveTessState({
        override: null,
        isWaving: true,
        isRecording: false,
        isThinking: false,
        isSpeaking: false,
        hasInput: true,
        isTalkMode: false,
      })
    ).toBe("typing");
  });

  it("returns waving when idle and engagement active", () => {
    expect(
      resolveTessState({
        override: null,
        isWaving: true,
        isRecording: false,
        isThinking: false,
        isSpeaking: false,
        hasInput: false,
        isTalkMode: false,
      })
    ).toBe("waving");
  });

  it("returns waving over passive talk mode", () => {
    expect(
      resolveTessState({
        override: null,
        isWaving: true,
        isRecording: false,
        isThinking: false,
        isSpeaking: false,
        hasInput: false,
        isTalkMode: true,
      })
    ).toBe("waving");
  });

  it("returns listening when recording", () => {
    expect(
      resolveTessState({
        override: null,
        isWaving: true,
        isRecording: true,
        isThinking: false,
        isSpeaking: false,
        hasInput: false,
        isTalkMode: true,
      })
    ).toBe("listening");
  });

  it("returns thinking while loading", () => {
    expect(
      resolveTessState({
        override: null,
        isWaving: false,
        isRecording: false,
        isThinking: true,
        isSpeaking: false,
        hasInput: false,
        isTalkMode: false,
      })
    ).toBe("thinking");
  });

  it("returns speaking over waving", () => {
    expect(
      resolveTessState({
        override: null,
        isWaving: true,
        isRecording: false,
        isThinking: false,
        isSpeaking: true,
        hasInput: false,
        isTalkMode: false,
      })
    ).toBe("speaking");
  });
});

describe("quickActionTessState", () => {
  it("maps emotional buttons to comforting", () => {
    expect(COMFORTING_QUICK_IDS.has("overwhelmed")).toBe(true);
    expect(quickActionTessState("overwhelmed")).toBe("comforting");
  });

  it("maps positive buttons to celebrating", () => {
    expect(CELEBRATING_QUICK_IDS.has("yes")).toBe(true);
    expect(quickActionTessState("yes")).toBe("celebrating");
  });
});

describe("speakingVisualDurationMs", () => {
  it("scales with text length within bounds", () => {
    expect(speakingVisualDurationMs("Hi")).toBeGreaterThanOrEqual(1800);
    expect(speakingVisualDurationMs("x".repeat(200))).toBeLessThanOrEqual(6000);
  });
});
