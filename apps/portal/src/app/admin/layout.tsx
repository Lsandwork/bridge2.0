import { redirect } from "next/navigation";
import { AdminPlatformShell } from "@/components/admin/AdminPlatformShell";
import { getSession } from "@/lib/auth/session";
import { isAdminRole } from "@family-support/data";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) {
    redirect("/login?next=/admin");
  }
  return <AdminPlatformShell>{children}</AdminPlatformShell>;
}
