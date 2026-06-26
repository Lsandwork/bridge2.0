"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  ShieldAlert,
  HeartPulse,
  Inbox,
  CreditCard,
  Activity,
  AlertTriangle,
  Stethoscope,
  MessageSquare,
  Link2,
  BookOpen,
  DollarSign,
  FlaskConical,
  Settings,
  Menu,
  X,
  ScrollText,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { StatusPill } from "./AdminUi";

type Tab = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  superAdminOnly?: boolean;
  accent?: boolean;
};

const tabs: Tab[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/new-signups", label: "New Signups", icon: UserPlus },
  { href: "/admin/safety-alerts", label: "Safety Center", icon: ShieldAlert, accent: true },
  { href: "/admin/health-reports", label: "Health Reports", icon: HeartPulse },
  { href: "/admin/requests", label: "Requests", icon: Inbox },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/bridge-groups", label: "Bridge Groups", icon: Link2 },
  { href: "/admin/pricing", label: "Pricing & Coverage", icon: DollarSign },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/credits", label: "Credits / Library", icon: BookOpen },
  { href: "/admin/activity", label: "User Activity", icon: Activity },
  { href: "/admin/error-logs", label: "Error Logs", icon: AlertTriangle },
  { href: "/admin/diagnostics", label: "Diagnostics", icon: Stethoscope },
  { href: "/admin/demo-accounts", label: "Demo Accounts", icon: FlaskConical },
  { href: "/admin/audit", label: "Audit Trail", icon: ScrollText, superAdminOnly: true },
  { href: "/admin/settings", label: "Platform Settings", icon: Settings },
];

export function AdminPlatformShell({
  children,
  systemStatus,
}: {
  children: React.ReactNode;
  systemStatus?: "healthy" | "warning" | "critical";
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const isSuperAdmin = user?.role === "super_admin";

  const visibleTabs = tabs.filter((t) => !t.superAdminOnly || isSuperAdmin);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-800 bg-[#111827] transition-transform lg:static lg:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="border-b border-slate-800 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">Nuvio Bridge</p>
            <h1 className="mt-1 text-lg font-bold text-white">Admin Command Center</h1>
            {systemStatus ? (
              <div className="mt-3">
                <StatusPill status={systemStatus} />
              </div>
            ) : null}
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {visibleTabs.map((tab) => {
              const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    tab.accent
                      ? active
                        ? "bg-rose-600 text-white"
                        : "text-rose-300 hover:bg-rose-950/50"
                      : active
                        ? "bg-indigo-600 text-white"
                        : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-slate-800 p-4 text-xs text-slate-400">
            <p className="font-semibold text-slate-200">{user?.name ?? "Admin"}</p>
            <p className="truncate">{user?.email}</p>
            <p className="mt-1 capitalize text-indigo-300">{user?.role?.replace(/_/g, " ")}</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-3 border-b border-slate-800 bg-[#111827]/80 px-4 py-4 backdrop-blur lg:px-8">
            <button type="button" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <button type="button" className="hidden lg:hidden" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wider text-slate-500">Operations dashboard</p>
              <p className="truncate text-sm text-slate-300">Manage users, safety, payments, and platform health</p>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="shrink-0 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
            >
              Preview public site
            </a>
          </header>
          <main className="flex-1 bg-slate-50 p-4 text-slate-900 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
