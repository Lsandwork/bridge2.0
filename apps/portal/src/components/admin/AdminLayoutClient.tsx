"use client";

import { AdminPlatformShell } from "@/components/admin/AdminPlatformShell";
import { useAdminFetch } from "@/hooks/useAdminFetch";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { data } = useAdminFetch<{ systemStatus?: "healthy" | "warning" | "critical" }>(
    "/api/admin/overview"
  );
  return (
    <AdminPlatformShell systemStatus={data?.systemStatus}>{children}</AdminPlatformShell>
  );
}
