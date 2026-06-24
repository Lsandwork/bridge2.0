"use client";

import { LogOut } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { useAuth } from "@/components/AuthProvider";

type SignOutButtonProps = {
  variant?: "default" | "compact" | "myspace";
  className?: string;
  showIcon?: boolean;
};

export function SignOutButton({ variant = "default", className = "", showIcon = true }: SignOutButtonProps) {
  const { signOut } = useAuth();
  const { t } = useLanguage();

  const base =
    variant === "compact"
      ? "inline-flex min-h-[2.5rem] items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-slate-50"
      : variant === "myspace"
        ? "inline-flex min-h-[2.75rem] items-center gap-1 rounded-full border-2 border-[var(--ms-accent)] px-2.5 py-1 text-[10px] font-bold text-[var(--ms-accent)] sm:px-3"
        : "inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800";

  return (
    <button
      type="button"
      onClick={() => signOut()}
      className={`${base} ${className}`.trim()}
      aria-label={t("nav.signOut")}
    >
      {showIcon ? <LogOut className={variant === "compact" ? "h-3.5 w-3.5" : "h-4 w-4"} /> : null}
      {t("nav.signOut")}
    </button>
  );
}
