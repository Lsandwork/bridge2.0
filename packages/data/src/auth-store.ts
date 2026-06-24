import type { AppRole } from "@family-support/core";
import { linkUserToProfile } from "./access-code-store";

export type DemoAuthUser = {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  password: string;
  mustChangePassword: boolean;
};

export type PublicAuthUser = Omit<DemoAuthUser, "password">;

const demoUsers: DemoAuthUser[] = [
  {
    id: "u-admin",
    email: "lsand.work@gmail.com",
    name: "Lonnie Admin",
    role: "admin",
    password: "password123",
    mustChangePassword: true,
  },
  {
    id: "u-parent",
    email: "erika@test.com",
    name: "Erika Parent",
    role: "parent_guardian",
    password: "password123",
    mustChangePassword: true,
  },
  {
    id: "u-therapist",
    email: "therapist@test.com",
    name: "Jordan Therapist",
    role: "caregiver_therapist_teacher",
    password: "password123",
    mustChangePassword: true,
  },
  {
    id: "u-child",
    email: "nathan@test.com",
    name: "Nathan",
    role: "child_user",
    password: "password123",
    mustChangePassword: true,
  },
];

function toPublic(user: DemoAuthUser): PublicAuthUser {
  const { password: _password, ...rest } = user;
  return rest;
}

export function listDemoAuthUsers(): PublicAuthUser[] {
  return demoUsers.map(toPublic);
}

export function authenticateDemoUser(email: string, password: string): PublicAuthUser | null {
  const user = demoUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || user.password !== password) return null;
  return toPublic(user);
}

export function getDemoAuthUserByEmail(email: string): PublicAuthUser | null {
  const user = demoUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  return user ? toPublic(user) : null;
}

export function changeDemoUserPassword(email: string, currentPassword: string, newPassword: string): PublicAuthUser {
  const user = demoUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) throw new Error("Account not found.");
  if (user.password !== currentPassword) throw new Error("Current password is incorrect.");
  if (newPassword.length < 8) throw new Error("New password must be at least 8 characters.");
  if (newPassword === "password123") throw new Error("Choose a password different from the temporary one.");
  user.password = newPassword;
  user.mustChangePassword = false;
  return toPublic(user);
}

export function getDemoAuthUserById(id: string): PublicAuthUser | null {
  const user = demoUsers.find((u) => u.id === id);
  return user ? toPublic(user) : null;
}

export function registerDemoUser(input: {
  email: string;
  password: string;
  name: string;
  role: "parent_guardian" | "caregiver_therapist_teacher";
}): PublicAuthUser {
  const email = input.email.trim().toLowerCase();
  if (!email.includes("@")) throw new Error("Enter a valid email address.");
  if (input.password.length < 8) throw new Error("Password must be at least 8 characters.");
  if (demoUsers.some((u) => u.email.toLowerCase() === email)) {
    throw new Error("An account with this email already exists. Sign in instead.");
  }

  const user: DemoAuthUser = {
    id: `u-${Date.now()}`,
    email,
    name: input.name.trim(),
    role: input.role,
    password: input.password,
    mustChangePassword: false,
  };
  demoUsers.push(user);
  return toPublic(user);
}

export function createChildLoginAccount(input: {
  email: string;
  password: string;
  name: string;
  profileId: string;
}): PublicAuthUser {
  const email = input.email.trim().toLowerCase();
  if (!email.includes("@")) throw new Error("Enter a valid email for My Space login.");
  if (input.password.length < 8) throw new Error("Password must be at least 8 characters.");
  if (demoUsers.some((u) => u.email.toLowerCase() === email)) {
    throw new Error("This email is already in use.");
  }

  const user: DemoAuthUser = {
    id: `u-child-${Date.now()}`,
    email,
    name: input.name.trim(),
    role: "child_user",
    password: input.password,
    mustChangePassword: false,
  };
  demoUsers.push(user);
  linkUserToProfile(user.id, input.profileId, "self");
  return toPublic(user);
}

export function adminSetUserPassword(
  userId: string,
  newPassword: string,
  mustChangePassword = false
): PublicAuthUser {
  const user = demoUsers.find((u) => u.id === userId);
  if (!user) throw new Error("User not found.");
  if (newPassword.length < 8) throw new Error("Password must be at least 8 characters.");
  user.password = newPassword;
  user.mustChangePassword = mustChangePassword;
  return toPublic(user);
}

export function adminResetUserPassword(userId: string): { tempPassword: string; user: PublicAuthUser } {
  const tempPassword = "password123";
  const user = adminSetUserPassword(userId, tempPassword, true);
  return { tempPassword, user };
}
