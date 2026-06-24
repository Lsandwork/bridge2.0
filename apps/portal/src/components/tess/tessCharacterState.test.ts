import { describe, expect, it } from "vitest";
import {
  mapTessStateToCharacter,
  mapVoiceStatusToCharacter,
  CHARACTER_STATUS,
} from "./tessCharacterState";

describe("tessCharacterState", () => {
  it("maps waving to waving", () => {
    expect(mapTessStateToCharacter("waving")).toBe("waving");
  });

  it("maps comforting to happy", () => {
    expect(mapTessStateToCharacter("comforting")).toBe("happy");
  });

  it("maps celebrating", () => {
    expect(mapTessStateToCharacter("celebrating")).toBe("celebrating");
  });

  it("maps error priority", () => {
    expect(mapTessStateToCharacter("speaking", true)).toBe("error");
  });

  it("maps voice recording to listening", () => {
    expect(mapVoiceStatusToCharacter("recording")).toBe("listening");
  });

  it("maps voice speaking to tessSpeaking", () => {
    expect(mapVoiceStatusToCharacter("speaking")).toBe("tessSpeaking");
  });

  it("has status copy for every state", () => {
    const states = [
      "idle",
      "greeting",
      "listening",
      "userSpeaking",
      "thinking",
      "tessSpeaking",
      "happy",
      "celebrating",
      "confused",
      "error",
      "sleeping",
    ] as const;
    for (const s of states) {
      expect(CHARACTER_STATUS[s].length).toBeGreaterThan(0);
    }
  });
});
