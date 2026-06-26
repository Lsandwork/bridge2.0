import type { SafetyConcernCategory, SafetySeverity } from "../platform/types";
import type { TessRiskLevel } from "../tess/types";

const SELF_HARM = [
  /\b(kill myself|suicide|suicidal|self[- ]?harm|hurt myself|want to die|don't want to live|end my life)\b/i,
  /\b(cutting myself|cut myself)\b/i,
];

const HARM_OTHERS = [
  /\b(hurt (someone|them|him|her|people)|kill (someone|them|him|her))\b/i,
  /\b(threaten(ed|ing)? to (hurt|kill))\b/i,
  /\b(bring a (gun|knife|weapon))\b/i,
];

const BULLYING = [
  /\b(bull(y|ies|ied|ying)|picked on|made fun of me|harassed)\b/i,
  /\b(nobody likes me|everyone hates me)\b/i,
];

const ABUSE = [
  /\b(abuse|neglect|someone hurt me|touched me|not safe at home|unsafe)\b/i,
  /\b(running away|elope)\b/i,
];

const SUBSTANCE = [
  /\b(drugs|overdose|pills to feel|getting high|drunk|vaping)\b/i,
  /\b(took (pills|medicine) to (hurt|end))\b/i,
];

const ILLEGAL_UNSAFE = [
  /\b(steal|shoplift|break in|illegal)\b/i,
  /\b(can't breathe|cannot breathe|choking|seizure|call 911)\b/i,
];

const CRISIS = [
  /\b(emergency now|help me now|right now i'm scared)\b/i,
  /\b(overwhelmed|meltdown|can't cope|need help now)\b/i,
  /\b(scared|afraid|panic)\b/i,
];

const MEDICAL_EMERGENCY = [
  /\b(can't breathe|cannot breathe|choking|seizure|call 911)\b/i,
];

export type PlatformSafetyResult = {
  flagged: boolean;
  severity: SafetySeverity;
  riskLevel: TessRiskLevel;
  concernCategory: SafetyConcernCategory;
  description: string;
  emergencyRecommended: boolean;
  notifyAdults: boolean;
};

export function checkPlatformSafety(content: string): PlatformSafetyResult {
  const text = content.trim();
  if (!text) {
    return {
      flagged: false,
      severity: "low",
      riskLevel: "low",
      concernCategory: "distress",
      description: "",
      emergencyRecommended: false,
      notifyAdults: false,
    };
  }

  const checks: Array<{
    patterns: RegExp[];
    severity: SafetySeverity;
    riskLevel: TessRiskLevel;
    category: SafetyConcernCategory;
    description: string;
    emergency: boolean;
  }> = [
    {
      patterns: SELF_HARM,
      severity: "critical",
      riskLevel: "urgent",
      category: "self_harm",
      description: "Possible self-harm or suicidal concern",
      emergency: true,
    },
    {
      patterns: HARM_OTHERS,
      severity: "critical",
      riskLevel: "urgent",
      category: "harm_to_others",
      description: "Possible harm-to-others concern",
      emergency: true,
    },
    {
      patterns: MEDICAL_EMERGENCY,
      severity: "critical",
      riskLevel: "urgent",
      category: "crisis_language",
      description: "Possible immediate medical emergency",
      emergency: true,
    },
    {
      patterns: ABUSE,
      severity: "high",
      riskLevel: "high",
      category: "abuse",
      description: "Possible abuse or safety concern",
      emergency: false,
    },
    {
      patterns: SUBSTANCE,
      severity: "high",
      riskLevel: "high",
      category: "substance_danger",
      description: "Possible substance-related danger",
      emergency: false,
    },
    {
      patterns: BULLYING,
      severity: "moderate",
      riskLevel: "high",
      category: "bullying",
      description: "Possible bullying concern",
      emergency: false,
    },
    {
      patterns: ILLEGAL_UNSAFE,
      severity: "moderate",
      riskLevel: "medium",
      category: "illegal_unsafe_act",
      description: "Possible unsafe or illegal activity",
      emergency: false,
    },
    {
      patterns: CRISIS,
      severity: "moderate",
      riskLevel: "medium",
      category: "crisis_language",
      description: "User may be in distress",
      emergency: false,
    },
  ];

  for (const check of checks) {
    if (check.patterns.some((p) => p.test(text))) {
      return {
        flagged: true,
        severity: check.severity,
        riskLevel: check.riskLevel,
        concernCategory: check.category,
        description: check.description,
        emergencyRecommended: check.emergency,
        notifyAdults: check.severity !== "low",
      };
    }
  }

  return {
    flagged: false,
    severity: "low",
    riskLevel: "low",
    concernCategory: "distress",
    description: "",
    emergencyRecommended: false,
    notifyAdults: false,
  };
}

export function mapSeverityToTessRisk(severity: SafetySeverity): TessRiskLevel {
  if (severity === "critical") return "urgent";
  if (severity === "high") return "high";
  if (severity === "moderate") return "medium";
  return "low";
}
