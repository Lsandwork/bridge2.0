"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AdminUser = { id: string; email: string; name: string; role: string };

const nav = [
  { href: "/", label: "Overview" },
  { href: "/diagnostics", label: "Diagnostics" },
  { href: "/users", label: "Users" },
  { href: "/library", label: "Library Content" },
  { href: "/ai-review", label: "AI Review Logs" },
  { href: "/tess/logs", label: "Tess AI Logs" },
  { href: "/tess/safety", label: "Tess Safety" },
  { href: "/tess/prompts", label: "Tess Prompts" },
  { href: "/tess/provider", label: "Tess Provider" },
  { href: "/subscriptions", label: "Subscriptions" },
  { href: "/support", label: "Support Tickets" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    if (pathname === "/login") return;
    fetch("/api/auth/session")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, [pathname]);

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  if (pathname === "/login") return <>{children}</>;

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-8">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Bridge</p>
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <span className="hidden text-sm text-slate-600 sm:inline dark:text-slate-300">{user.email}</span>
            ) : null}
            <button
              type="button"
              onClick={signOut}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 dark:border-slate-600 dark:text-slate-200"
            >
              Sign out
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-3 md:px-8">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      {children}
    </div>
  );
}
