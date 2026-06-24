import { describe, expect, it } from "vitest";
import { mapTessStateToAvatar, mapVoiceStatusToAvatar } from "./tessAvatarState";

describe("tessAvatarState", () => {
  it("maps session states to avatar states", () => {
    expect(mapTessStateToAvatar("listening")).toBe("listening");
    expect(mapTessStateToAvatar("speaking")).toBe("speaking");
    expect(mapTessStateToAvatar("thinking")).toBe("thinking");
    expect(mapTessStateToAvatar("idle")).toBe("idle");
    expect(mapTessStateToAvatar("waving", true)).toBe("error");
  });

  it("maps voice status to avatar states", () => {
    expect(mapVoiceStatusToAvatar("recording")).toBe("listening");
    expect(mapVoiceStatusToAvatar("thinking")).toBe("thinking");
    expect(mapVoiceStatusToAvatar("speaking")).toBe("speaking");
    expect(mapVoiceStatusToAvatar("idle")).toBe("idle");
  });
});
