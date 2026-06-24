import { describe, expect, it } from "vitest";
import {
  adminAddLibraryCredits,
  adminSetAccessPlan,
  getAdminDiagnostics,
  getLibraryAccessForUser,
  logUserActivity,
} from "./admin-diagnostics-store";
import { adminResetUserPassword } from "./auth-store";

describe("admin-diagnostics-store", () => {
  it("returns seeded user accounts with access metadata", () => {
    const { users } = getAdminDiagnostics();
    expect(users.length).toBeGreaterThanOrEqual(4);
    expect(users.find((u) => u.email === "erika@test.com")?.accessPlan).toBe("monthly");
  });

  it("logs and returns activity", () => {
    logUserActivity("u-parent", "erika@test.com", "test_action", "hello");
    const { activity } = getAdminDiagnostics();
    expect(activity.some((a) => a.action === "test_action")).toBe(true);
  });

  it("adds library credits", () => {
    const before = getLibraryAccessForUser("u-parent").libraryCredits;
    adminAddLibraryCredits("u-parent", 3, "test grant");
    expect(getLibraryAccessForUser("u-parent").libraryCredits).toBe(before + 3);
  });

  it("sets monthly and annual access with expiry", () => {
    adminSetAccessPlan("u-child", "monthly");
    const monthly = getLibraryAccessForUser("u-child");
    expect(monthly.accessPlan).toBe("monthly");
    expect(monthly.hasFullAccess).toBe(true);
    expect(monthly.accessExpiresAt).toBeTruthy();

    adminSetAccessPlan("u-child", "annual");
    const annual = getLibraryAccessForUser("u-child");
    expect(annual.accessPlan).toBe("annual");
    expect(annual.hasFullAccess).toBe(true);
  });

  it("admin can reset password", () => {
    const { tempPassword, user } = adminResetUserPassword("u-therapist");
    expect(tempPassword).toBe("password123");
    expect(user.mustChangePassword).toBe(true);
  });
});
