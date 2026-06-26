import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isAdminRole } from "@family-support/data";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) {
    redirect("/login?next=/admin");
  }
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
