import { describe, expect, it } from "vitest";
import {
  FULLSCREEN_TESS_ANIMATION,
  getTessMotionCssVars,
  getWaveEngagementMs,
  tessMotionPreset,
} from "./tessMotionPreset";

describe("tessMotionPreset", () => {
  it("fullscreen preset uses calm target durations", () => {
    expect(FULLSCREEN_TESS_ANIMATION.speakingBodyDuration).toBe(1800);
    expect(FULLSCREEN_TESS_ANIMATION.idleFloatDuration).toBe(4200);
    expect(FULLSCREEN_TESS_ANIMATION.listeningRingDuration).toBe(2200);
  });

  it("fullscreen float distance stays within calm range", () => {
    expect(FULLSCREEN_TESS_ANIMATION.floatDistance).toBeGreaterThanOrEqual(4);
    expect(FULLSCREEN_TESS_ANIMATION.floatDistance).toBeLessThanOrEqual(8);
    expect(FULLSCREEN_TESS_ANIMATION.breathScale).toBeLessThanOrEqual(1.03);
  });

  it("exports css variables for companion", () => {
    const vars = getTessMotionCssVars("fullscreen");
    expect(vars["--tess-idle-float-dur"]).toBe("4200ms");
    expect(vars["--tess-speak-body-dur"]).toBe("1800ms");
    expect(vars["--tess-listen-ring-dur"]).toBe("2200ms");
  });

  it("wave engagement matches waving duration", () => {
    expect(getWaveEngagementMs("fullscreen")).toBe(tessMotionPreset.fullscreen.waveEngagementDuration);
    expect(getWaveEngagementMs("fullscreen")).toBe(2600);
  });
});
