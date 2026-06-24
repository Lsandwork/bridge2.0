import { describe, expect, it } from "vitest";
import {
  detectEmergencySafetyConcern,
  detectFeelingBetter,
  detectSupportiveDanceTrigger,
} from "./emotionDetection";

describe("emotionDetection", () => {
  it("detects dance triggers", () => {
    expect(detectSupportiveDanceTrigger("I'm feeling overwhelmed")).toBe(true);
    expect(detectSupportiveDanceTrigger("Having a rough day")).toBe(true);
    expect(detectSupportiveDanceTrigger("What's the weather?")).toBe(false);
  });

  it("detects safety concerns", () => {
    expect(detectEmergencySafetyConcern("I want to hurt myself")).toBe(true);
    expect(detectSupportiveDanceTrigger("I want to hurt myself")).toBe(false);
  });

  it("detects feeling better", () => {
    expect(detectFeelingBetter("I'm good")).toBe(true);
    expect(detectFeelingBetter("feeling better now")).toBe(true);
  });
});
