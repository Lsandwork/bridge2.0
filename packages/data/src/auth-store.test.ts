import { describe, expect, it } from "vitest";
import { authenticateDemoUser, changeDemoUserPassword } from "./auth-store";

describe("auth-store", () => {
  it("authenticates @demo.com investor demo users", () => {
    expect(authenticateDemoUser("caregiver@demo.com", "password123")?.role).toBe("parent_guardian");
    expect(authenticateDemoUser("casemanager@demo.com", "password123")?.role).toBe("caregiver_therapist_teacher");
    expect(authenticateDemoUser("user@demo.com", "password123")?.role).toBe("child_user");
  });

  it("rejects non-demo emails", () => {
    expect(authenticateDemoUser("erika@test.com", "password123")).toBeNull();
    expect(authenticateDemoUser("real@parent.com", "password123")).toBeNull();
  });

  it("clears mustChangePassword after change", () => {
    const updated = changeDemoUserPassword("caregiver@demo.com", "password123", "newpassword99");
    expect(updated.mustChangePassword).toBe(false);
    expect(authenticateDemoUser("caregiver@demo.com", "newpassword99")?.email).toBe("caregiver@demo.com");
  });
});
