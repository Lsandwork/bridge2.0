import { describe, expect, it } from "vitest";
import {
  checkPlatformSafety,
  NUVIO_CRISIS_RESPONSE,
} from "@family-support/core";
import {
  createBridgeAccessCode,
  createSafetyAlertFromMessage,
  DEMO_BRIDGE_GROUP_ID,
  getBridgeGroupsForUser,
  isAdminRole,
  isDemoAccountEmail,
  listSafetyAlertsForUser,
  redeemBridgeAccessCode,
  revokeBridgeAccessCode,
  sendBridgeMessage,
  shouldSeeLegacyDemoData,
  usersShareBridgeGroup,
} from "@family-support/data";

describe("platform safety", () => {
  it("detects self-harm language", () => {
    const result = checkPlatformSafety("I want to hurt myself");
    expect(result.flagged).toBe(true);
    expect(result.concernCategory).toBe("self_harm");
    expect(result.notifyAdults).toBe(true);
  });

  it("detects bullying language", () => {
    const result = checkPlatformSafety("Everyone bullies me at school");
    expect(result.flagged).toBe(true);
    expect(result.concernCategory).toBe("bullying");
  });

  it("uses supportive Nuvio crisis copy", () => {
    expect(NUVIO_CRISIS_RESPONSE).toContain("glad you told me");
    expect(NUVIO_CRISIS_RESPONSE).not.toContain("reported you");
  });
});

describe("bridge groups", () => {
  it("demo access code joins Jasper bridge", () => {
    const code = createBridgeAccessCode({
      bridgeGroupId: DEMO_BRIDGE_GROUP_ID,
      memberRole: "therapist",
      createdBy: "u-admin",
    });
    const result = redeemBridgeAccessCode(code.code, "u-therapist");
    expect(result.ok).toBe(true);
    expect(getBridgeGroupsForUser("u-therapist").some((g) => g.id === DEMO_BRIDGE_GROUP_ID)).toBe(true);
  });

  it("revoked access code fails", () => {
    const code = createBridgeAccessCode({
      bridgeGroupId: DEMO_BRIDGE_GROUP_ID,
      memberRole: "school_iep",
      createdBy: "u-admin",
    });
    revokeBridgeAccessCode(code.id);
    const result = redeemBridgeAccessCode(code.code, "u-parent");
    expect(result.ok).toBe(false);
  });

  it("blocks messaging outside bridge group", () => {
    const result = sendBridgeMessage({
      bridgeGroupId: "bg-nonexistent",
      senderId: "u-demo-caregiver",
      body: "Hello",
    });
    expect("error" in result).toBe(true);
  });

  it("allows parent to message in same bridge", () => {
    expect(usersShareBridgeGroup("u-demo-caregiver", "u-demo-casemanager")).toBe(true);
    const result = sendBridgeMessage({
      bridgeGroupId: DEMO_BRIDGE_GROUP_ID,
      senderId: "u-demo-caregiver",
      body: "Can we sync on Jasper's goals?",
    });
    expect("error" in result).toBe(false);
  });
});

describe("safety alerts", () => {
  it("creates alert for harm-to-others phrase", () => {
    const alert = createSafetyAlertFromMessage({
      userId: "u-demo-user",
      message: "I want to hurt someone at school",
      bridgeGroupId: DEMO_BRIDGE_GROUP_ID,
    });
    expect(alert).not.toBeNull();
    expect(alert?.concernCategory).toBe("harm_to_others");
  });

  it("hides alerts from child dashboard API role", () => {
    const alerts = listSafetyAlertsForUser("u-demo-user");
    expect(alerts).toHaveLength(0);
  });

  it("shows alerts to caregiver", () => {
    const alerts = listSafetyAlertsForUser("u-demo-caregiver", { includeDemo: true });
    expect(alerts.length).toBeGreaterThan(0);
  });
});

describe("demo isolation", () => {
  it("recognizes investor demo emails", () => {
    expect(isDemoAccountEmail("caregiver@demo.com")).toBe(true);
    expect(isDemoAccountEmail("real@parent.com")).toBe(false);
  });

  it("never exposes legacy Nathan/Sam data in production paths", () => {
    expect(shouldSeeLegacyDemoData("u-parent")).toBe(false);
    expect(shouldSeeLegacyDemoData("u-demo-caregiver")).toBe(false);
  });
});

describe("admin access", () => {
  it("allows admin roles", () => {
    expect(isAdminRole("admin")).toBe(true);
    expect(isAdminRole("parent_guardian")).toBe(false);
  });
});
