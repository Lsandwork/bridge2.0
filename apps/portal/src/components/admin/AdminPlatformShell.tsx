"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Link2,
  MessageSquare,
  ShieldAlert,
  Activity,
  AlertTriangle,
  Stethoscope,
  BookOpen,
  CreditCard,
  FlaskConical,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const tabs = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "User Accounts", icon: Users },
  { href: "/admin/bridge-groups", label: "Bridge Groups", icon: Link2 },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/safety-alerts", label: "Safety Alerts", icon: ShieldAlert, accent: true },
  { href: "/admin/activity", label: "User Activity", icon: Activity },
  { href: "/admin/error-logs", label: "Error Logs", icon: AlertTriangle },
  { href: "/admin/diagnostics", label: "Diagnostics", icon: Stethoscope },
  { href: "/admin/credits", label: "Credits / Library", icon: BookOpen },
  { href: "/admin/payments", label: "Payment Processors", icon: CreditCard },
  { href: "/admin/demo-accounts", label: "Demo Accounts", icon: FlaskConical },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminPlatformShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center border-b border-slate-200 px-5 dark:border-slate-800">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nuvio Bridge</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Admin Panel</p>
            </div>
            <button type="button" className="ml-auto lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="space-y-1 p-3">
            {tabs.map((tab) => {
              const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    tab.accent
                      ? active
                        ? "bg-rose-600 text-white"
                        : "text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
                      : active
                        ? "bg-indigo-600 text-white"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 lg:px-8">
            <button type="button" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <p className="text-sm text-slate-500">Platform administration — production controls</p>
            <Link href="/dashboard" className="ml-auto text-sm font-medium text-indigo-600 hover:underline">
              Back to portal
            </Link>
          </header>
          <main className="flex-1 p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
