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
    expect(users.length).toBeGreaterThanOrEqual(3);
    expect(users.find((u) => u.email === "caregiver@demo.com")?.accessPlan).toBe("monthly");
  });

  it("logs and returns activity", () => {
    logUserActivity("u-demo-caregiver", "caregiver@demo.com", "test_action", "hello");
    const { activity } = getAdminDiagnostics();
    expect(activity.some((a) => a.action === "test_action")).toBe(true);
  });

  it("adds library credits", () => {
    const before = getLibraryAccessForUser("u-demo-caregiver").libraryCredits;
    adminAddLibraryCredits("u-demo-caregiver", 3, "test grant");
    expect(getLibraryAccessForUser("u-demo-caregiver").libraryCredits).toBe(before + 3);
  });

  it("sets monthly and annual access with expiry", () => {
    adminSetAccessPlan("u-demo-user", "monthly");
    const monthly = getLibraryAccessForUser("u-demo-user");
    expect(monthly.accessPlan).toBe("monthly");
    expect(monthly.hasFullAccess).toBe(true);
    expect(monthly.accessExpiresAt).toBeTruthy();

    adminSetAccessPlan("u-demo-user", "annual");
    const annual = getLibraryAccessForUser("u-demo-user");
    expect(annual.accessPlan).toBe("annual");
    expect(annual.hasFullAccess).toBe(true);
  });

  it("admin can reset password", () => {
    const { tempPassword, user } = adminResetUserPassword("u-demo-casemanager");
    expect(tempPassword).toBe("password123");
    expect(user.mustChangePassword).toBe(true);
  });
});
