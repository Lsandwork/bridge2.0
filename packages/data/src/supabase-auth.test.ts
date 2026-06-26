import { describe, expect, it } from "vitest";
import {
  DEMO_AUTH_EMAILS,
  demoLogin,
  isDemoAuthEmail,
  isDemoAuthUserId,
} from "./supabase-auth";
import { LEGACY_DEMO_PROFILE_IDS } from "./demo-accounts";
import { resolveProfilesForSessionUser } from "./session-profiles";
import { getEmptyDashboard } from "./local-store";

describe("supabase-auth demo isolation", () => {
  it("recognizes reserved demo emails", () => {
    expect(isDemoAuthEmail("erika@test.com")).toBe(true);
    expect(isDemoAuthEmail("new.parent@example.com")).toBe(false);
  });

  it("authenticates demo parent without Supabase tokens", () => {
    const user = demoLogin("erika@test.com", "password123");
    expect(user?.isDemo).toBe(true);
    expect(user?.role).toBe("parent_guardian");
  });

  it("keeps demo parent on seeded profiles only", async () => {
    const profiles = await resolveProfilesForSessionUser({
      id: "u-parent",
      role: "parent_guardian",
      isDemo: true,
    });
    expect(profiles.map((p) => p.name)).toEqual(expect.arrayContaining(["Nathan", "Sam"]));
    expect(profiles.every((p) => LEGACY_DEMO_PROFILE_IDS.has(p.id))).toBe(true);
  });

  it("returns blank dashboard stats for new profile ids", () => {
    const snapshot = getEmptyDashboard("00000000-0000-4000-8000-000000000099", "Jasper");
    expect(snapshot.childName).toBe("Jasper");
    expect(snapshot.tasksCompletedPct).toBe(0);
    expect(snapshot.routinesCompletedPct).toBe(0);
    expect(snapshot.checkInsCount).toBe(0);
    expect(snapshot.weekChart.every((d) => d.tasks === 0 && d.routines === 0)).toBe(true);
  });

  it("does not treat production user ids as demo", () => {
    expect(isDemoAuthUserId("00000000-0000-4000-8000-000000000001")).toBe(false);
    expect([...DEMO_AUTH_EMAILS]).toContain("erika@test.com");
  });
});
