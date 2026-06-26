"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CheckSquare,
  MessageCircle,
  Target,
  Gift,
  FileText,
  BookOpen,
  Dumbbell,
  UsersRound,
  Settings,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { TessNavIcon } from "@/components/tess/TessIcon";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { NotificationBell } from "@/components/NotificationBell";
import { SignOutButton } from "@/components/SignOutButton";
import { useSupportPathway } from "@/components/SupportPathwayProvider";
import { supportPathways, type SupportPathwayId } from "@/lib/support-pathways";

type NavIcon = React.ComponentType<{ className?: string }>;

type NavItem = {
  href: string;
  labelKey: string;
  icon: NavIcon;
};

const mainNav: NavItem[] = [
  { href: "/dashboard", labelKey: "parent.nav.dashboard", icon: LayoutDashboard },
  { href: "/profiles", labelKey: "parent.nav.myChildren", icon: Users },
  { href: "/routines", labelKey: "parent.nav.routines", icon: Calendar },
  { href: "/tasks", labelKey: "parent.nav.tasks", icon: CheckSquare },
  { href: "/communication", labelKey: "parent.nav.communication", icon: MessageCircle },
  { href: "/goals", labelKey: "parent.nav.goals", icon: Target },
  { href: "/rewards", labelKey: "parent.nav.rewards", icon: Gift },
  { href: "/reports", labelKey: "parent.nav.reports", icon: FileText },
];

const contentNav: NavItem[] = [
  { href: "/library", labelKey: "parent.nav.parentEducation", icon: BookOpen },
  { href: "/pricing", labelKey: "parent.nav.pricingInsurance", icon: FileText },
  { href: "/social-stories", labelKey: "parent.nav.socialStories", icon: BookOpen },
  { href: "/exercises", labelKey: "parent.nav.exercises", icon: Dumbbell },
];

const toolsNav: NavItem[] = [
  { href: "/care-team", labelKey: "parent.nav.careTeam", icon: UsersRound },
  { href: "/tess", labelKey: "parent.nav.tessAssistant", icon: TessNavIcon },
  { href: "/settings", labelKey: "parent.nav.settings", icon: Settings },
];

function BridgeLogo() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-3 px-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
        <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none" aria-hidden>
          <path
            d="M8 22c0-4 3-8 8-8s8 4 8 8"
            stroke="#e9d5ff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="10" cy="12" r="3" fill="#c4b5fd" />
          <circle cx="22" cy="12" r="3" fill="#c4b5fd" />
          <path d="M13 12h6" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <p className="text-lg font-extrabold tracking-tight text-white">{t("parent.header.fallbackTitle")}</p>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-purple-200">
          {t("parent.brand.tagline")}
        </p>
      </div>
    </div>
  );
}

function NavLink({
  href,
  labelKey,
  icon: Icon,
  pathname,
  onNavigate,
}: {
  href: string;
  labelKey: string;
  icon: NavIcon;
  pathname: string;
  onNavigate?: () => void;
}) {
  const { t } = useLanguage();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex min-h-[2.75rem] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
        active
          ? "bg-[var(--sidebar-active)] text-white shadow-sm"
          : "text-[var(--sidebar-text)] hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0 opacity-90" />
      {t(labelKey)}
    </Link>
  );
}

function NavSection({
  titleKey,
  items,
  pathname,
  onNavigate,
}: {
  titleKey: string;
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="mt-4">
      <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-purple-300/80">{t(titleKey)}</p>
      <div className="space-y-0.5">
        {items.map((item) => (
          <NavLink key={item.href} {...item} pathname={pathname} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  user,
  signOut,
  router,
  onNavigate,
}: {
  pathname: string;
  user: { name: string; email: string } | null;
  signOut: () => Promise<void>;
  router: ReturnType<typeof useRouter>;
  onNavigate?: () => void;
}) {
  const { t } = useLanguage();
  const { pathway, selectPathway } = useSupportPathway();
  return (
    <>
      <BridgeLogo />
      <div className="mx-2 mt-5 rounded-xl border border-white/10 bg-white/10 p-2.5">
        <label className="block text-[9px] font-bold uppercase tracking-widest text-white/55">
          Support pathway
        </label>
        <div className="mt-1.5 flex items-center gap-2">
          <span
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold"
            style={{ background: pathway.accentSoft, color: pathway.accent }}
          >
            {pathway.icon}
          </span>
          <select
            value={pathway.id}
            onChange={(event) => selectPathway(event.target.value as SupportPathwayId)}
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-xs font-bold text-white outline-none"
            aria-label="Change support pathway"
          >
            {supportPathways.map((option) => (
              <option key={option.id} value={option.id} className="text-slate-900">{option.shortName}</option>
            ))}
          </select>
        </div>
      </div>
      <nav className="mt-6 flex-1 overflow-y-auto overscroll-contain" aria-label={t("parent.a11y.navLabel")}>
        <NavSection titleKey="parent.nav.section.main" items={mainNav} pathname={pathname} onNavigate={onNavigate} />
        <NavSection titleKey="parent.nav.section.library" items={contentNav} pathname={pathname} onNavigate={onNavigate} />
        <NavSection titleKey="parent.nav.section.tools" items={toolsNav} pathname={pathname} onNavigate={onNavigate} />
      </nav>
      <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
        <Link
          href="/my-space"
          onClick={onNavigate}
          className="flex min-h-[2.75rem] items-center justify-between rounded-xl bg-white/10 px-3 py-2.5 text-sm font-semibold text-white hover:bg-white/15"
        >
          {t("parent.sidebar.openMySpace")}
          <ChevronRight className="h-4 w-4" />
        </Link>
        {user ? (
          <div className="rounded-xl px-3 py-2">
            <p className="truncate text-xs font-semibold text-white">{user.name}</p>
            <p className="truncate text-[10px] text-purple-200/80">{user.email}</p>
            <button
              type="button"
              onClick={async () => {
                onNavigate?.();
                await signOut();
                router.push("/");
              }}
              className="mt-2 flex min-h-[2.5rem] w-full items-center gap-1.5 text-xs font-medium text-purple-200 hover:text-white"
            >
              <LogOut className="h-3 w-3" />
              {t("nav.signOut")}
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            onClick={onNavigate}
            className="block min-h-[2.5rem] rounded-xl px-3 py-2 text-xs font-medium text-purple-200 hover:text-white"
          >
            {t("parent.sidebar.signIn")}
          </Link>
        )}
      </div>
    </>
  );
}

export function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const hideNav =
    pathname === "/" ||
    pathname === "/onboarding" ||
    pathname === "/onboarding/account" ||
    pathname === "/login" ||
    pathname === "/change-password" ||
    pathname.startsWith("/my-space") ||
    pathname.startsWith("/setup") ||
    pathname.startsWith("/therapist");

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  if (hideNav) return <>{children}</>;

  const activeNav = mainNav.concat(contentNav, toolsNav).find((n) =>
    n.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(n.href)
  );
  const pageTitle = activeNav ? t(activeNav.labelKey) : t("parent.header.fallbackTitle");

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="flex min-h-screen min-h-[100dvh] bg-[var(--background)]">
      {menuOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label={t("parent.a11y.closeMenu")}
          onClick={closeMenu}
        />
      ) : null}

      <aside
        className={`portal-sidebar fixed inset-y-0 left-0 z-50 flex w-[min(18rem,88vw)] flex-col bg-[var(--sidebar)] px-3 py-5 shadow-xl transition-transform duration-200 ease-out lg:z-30 lg:w-64 lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))", paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          className="mb-3 flex min-h-[2.75rem] min-w-[2.75rem] items-center justify-center self-end rounded-xl text-white/80 hover:bg-white/10 lg:hidden"
          aria-label={t("parent.a11y.closeMenu")}
          onClick={closeMenu}
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent pathname={pathname} user={user} signOut={signOut} router={router} onNavigate={closeMenu} />
      </aside>

      <div className="flex min-h-screen min-h-[100dvh] w-full flex-1 flex-col lg:pl-64">
        <header
          className="sticky top-0 z-20 border-b border-[var(--border)] bg-white/95 backdrop-blur"
          style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-6 lg:py-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <button
                type="button"
                className="flex min-h-[2.75rem] min-w-[2.75rem] shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-white lg:hidden"
                aria-label={t("parent.a11y.openMenu")}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(true)}
              >
                <Menu className="h-5 w-5 text-[var(--text-primary)]" />
              </button>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                  {t("parent.header.eyebrow")}
                </p>
                <h1 className="truncate text-base font-bold text-[var(--text-primary)] lg:text-lg">{pageTitle}</h1>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <LanguageSwitcher compact />
              {user && user.role !== "child_user" ? <NotificationBell /> : null}
              <SignOutButton variant="compact" className="hidden sm:inline-flex" />
              <Link href="/pricing" className="btn-secondary hidden px-3 py-1.5 text-xs sm:inline-flex">
                {t("parent.header.insurance")}
              </Link>
              <Link href="/my-space/games" className="btn-secondary hidden px-3 py-1.5 text-xs md:inline-flex">
                {t("parent.header.games")}
              </Link>
              <span className="hidden rounded-full bg-[var(--brand-light)] px-2.5 py-1 text-[10px] font-semibold text-[var(--brand-dark)] sm:inline sm:px-3 sm:text-xs">
                {t("parent.header.liveBadge")}
              </span>
            </div>
          </div>
        </header>
        <div
          className="flex-1"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
