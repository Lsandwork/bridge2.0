"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Target,
  Activity,
  MessageSquare,
  FileText,
  Shield,
  School,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { NotificationBell } from "@/components/NotificationBell";
import { SignOutButton } from "@/components/SignOutButton";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";

const NAV = [
  { href: "/therapist", labelKey: "therapist.nav.dashboard", icon: LayoutDashboard },
  { href: "/therapist/clients", labelKey: "therapist.nav.clients", icon: Users },
  { href: "/therapist/goals", labelKey: "therapist.nav.goals", icon: Target },
  { href: "/therapist/behavior", labelKey: "therapist.nav.behavior", icon: Activity },
  { href: "/therapist/messages", labelKey: "therapist.nav.messages", icon: MessageSquare },
  { href: "/therapist/insurance", labelKey: "therapist.nav.insurance", icon: Shield },
  { href: "/therapist/documentation", labelKey: "therapist.nav.documentation", icon: FileText },
  { href: "/therapist/school", labelKey: "therapist.nav.schoolIep", icon: School },
];

export function TherapistShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="therapist-root">
      {menuOpen ? (
        <button
          type="button"
          className="th-overlay lg:hidden"
          aria-label={t("therapist.a11y.closeMenu")}
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <aside className={`th-sidebar flex w-64 flex-col p-4 ${menuOpen ? "open" : ""}`}>
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-lg font-extrabold text-teal-400">Bridge</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {t("therapist.brand.roleLabel")}
            </p>
          </div>
          <button type="button" className="rounded-lg p-2 text-slate-400 lg:hidden" onClick={() => setMenuOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 flex-1 space-y-0.5 overflow-y-auto" aria-label={t("therapist.a11y.navLabel")}>
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/therapist" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-[2.75rem] items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold ${
                  active ? "bg-teal-500/20 text-teal-300" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="truncate text-xs font-semibold text-white">{user?.name}</p>
          <p className="truncate text-[10px] text-slate-500">{user?.email}</p>
          <Link href="/my-space" className="mt-2 block text-xs font-semibold text-teal-400 hover:text-teal-300">
            {t("therapist.sidebar.previewMySpace")}
          </Link>
          <button
            type="button"
            onClick={() => signOut()}
            className="mt-2 flex items-center gap-1 text-xs text-slate-500 hover:text-white"
          >
            <LogOut className="h-3 w-3" /> {t("nav.signOut")}
          </button>
        </div>
      </aside>

      <div className="th-main flex min-h-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/10 bg-[#0f172a]/95 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-white/10 p-2 lg:hidden"
              aria-label={t("therapist.a11y.openMenu")}
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {t("therapist.header.eyebrow")}
              </p>
              <p className="text-sm font-bold">{t("therapist.header.title")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell dark />
            <SignOutButton variant="compact" className="border-white/10 text-slate-300 hover:bg-white/5 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 lg:hidden" />
            <LanguageSwitcher compact />
          </div>
        </header>
        <div className="flex-1 px-4 py-6 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
