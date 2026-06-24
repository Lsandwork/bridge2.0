import { TESS_CRISIS_DISCLAIMER, type TessRiskLevel } from "./types";

const URGENT_PATTERNS = [
  /\b(kill myself|suicide|self[- ]?harm|hurt myself|want to die)\b/i,
  /\b(hurt (someone|them|him|her)|kill (someone|them))\b/i,
  /\b(can't breathe|cannot breathe|trouble breathing|choking|seizure)\b/i,
  /\b(call 911|emergency now)\b/i,
];

const HIGH_PATTERNS = [
  /\b(abuse|neglect|someone hurt me|not safe|unsafe|running away|elope)\b/i,
  /\b(severe pain|bleeding badly|lost\b)/i,
  /\b(parent can't keep|crisis meltdown)\b/i,
];

const MEDIUM_PATTERNS = [
  /\b(overwhelmed|meltdown|can't cope|need help now)\b/i,
  /\b(scared|afraid|panic)\b/i,
];

export type SafetyCheckResult = {
  flagged: boolean;
  riskLevel: TessRiskLevel;
  flagType?: string;
  description?: string;
};

export function checkTessSafety(content: string): SafetyCheckResult {
  for (const p of URGENT_PATTERNS) {
    if (p.test(content)) {
      return {
        flagged: true,
        riskLevel: "urgent",
        flagType: "emergency_or_harm",
        description: "Possible emergency or harm concern detected",
      };
    }
  }
  for (const p of HIGH_PATTERNS) {
    if (p.test(content)) {
      return {
        flagged: true,
        riskLevel: "high",
        flagType: "safety_concern",
        description: "Possible safety concern detected",
      };
    }
  }
  for (const p of MEDIUM_PATTERNS) {
    if (p.test(content)) {
      return {
        flagged: true,
        riskLevel: "medium",
        flagType: "distress",
        description: "User may be in distress",
      };
    }
  }
  return { flagged: false, riskLevel: "low" };
}

export const TESS_SAFETY_FALLBACK =
  "I'm having trouble responding right now. You can still use your schedule, communication cards, routines, and emergency support card.";

export const TESS_CRISIS_RESPONSE = `I hear that something feels really hard right now. ${TESS_CRISIS_DISCLAIMER}

If you can, tell a trusted adult nearby. You can also use your emergency support card in Bridge.`;
