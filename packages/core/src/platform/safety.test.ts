import { describe, expect, it } from "vitest";
import { checkPlatformSafety } from "./safety";

describe("checkPlatformSafety", () => {
  it("flags drug danger", () => {
    const r = checkPlatformSafety("I took pills to feel better");
    expect(r.flagged).toBe(true);
    expect(r.concernCategory).toBe("substance_danger");
  });

  it("returns safe for neutral text", () => {
    const r = checkPlatformSafety("I finished my morning routine");
    expect(r.flagged).toBe(false);
  });
});
