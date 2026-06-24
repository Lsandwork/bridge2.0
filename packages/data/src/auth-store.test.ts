import { describe, expect, it } from "vitest";
import { authenticateDemoUser, changeDemoUserPassword } from "./auth-store";

describe("auth-store", () => {
  it("authenticates seeded demo users", () => {
    expect(authenticateDemoUser("erika@test.com", "password123")?.role).toBe("parent_guardian");
    expect(authenticateDemoUser("lsand.work@gmail.com", "password123")?.role).toBe("admin");
    expect(authenticateDemoUser("therapist@test.com", "password123")?.role).toBe("caregiver_therapist_teacher");
    expect(authenticateDemoUser("nathan@test.com", "password123")?.role).toBe("child_user");
  });

  it("requires password change on first login flag", () => {
    const user = authenticateDemoUser("erika@test.com", "password123");
    expect(user?.mustChangePassword).toBe(true);
  });

  it("clears mustChangePassword after change", () => {
    const updated = changeDemoUserPassword("therapist@test.com", "password123", "newpassword99");
    expect(updated.mustChangePassword).toBe(false);
    expect(authenticateDemoUser("therapist@test.com", "newpassword99")?.email).toBe("therapist@test.com");
  });
});
