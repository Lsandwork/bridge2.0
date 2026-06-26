import type { AppRole } from "@family-support/core";

type AuthUser = {
  mustChangePassword?: boolean;
  role?: AppRole | string;
};

export function resolvePostLoginDestination(
  user: AuthUser | undefined,
  redirectTo: string | undefined,
  nextParam: string
): string {
  if (user?.mustChangePassword) return "/change-password";

  const role = user?.role ?? "";
  const isAdmin = role === "admin" || role === "super_admin";

  if (isAdmin) {
    if (nextParam.startsWith("/admin")) return nextParam;
    return redirectTo ?? "/admin";
  }

  if (nextParam && !user?.mustChangePassword) return nextParam;
  return redirectTo ?? "/dashboard";
}
