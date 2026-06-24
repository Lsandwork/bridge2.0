import { describe, expect, it } from "vitest";
import { getSessionCookieDomain, parseSessionCookie } from "./session-cookie";

describe("session cookies", () => {
  it("shares production sessions between apex and www", () => {
    expect(getSessionCookieDomain("https://www.nuviobridge.com")).toBe(".nuviobridge.com");
    expect(getSessionCookieDomain("https://nuviobridge.com")).toBe(".nuviobridge.com");
  });

  it("does not set a broad domain for localhost or Vercel previews", () => {
    expect(getSessionCookieDomain("http://localhost:4000")).toBeUndefined();
    expect(getSessionCookieDomain("https://bridge-example.vercel.app")).toBeUndefined();
  });

  it("reads the encoded Bridge session payload", () => {
    const user = {
      id: "user-1",
      email: "parent@example.com",
      name: "Parent",
      role: "parent_guardian" as const,
      mustChangePassword: false,
    };
    expect(parseSessionCookie(encodeURIComponent(JSON.stringify(user)))).toEqual(user);
  });
});
