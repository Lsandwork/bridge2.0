"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SignOutButton } from "@/components/SignOutButton";
import { useAuth } from "@/components/AuthProvider";

type Props = {
  profileInitial?: string;
  showParentLink?: boolean;
};

export function BridgeHeader({ profileInitial = "B", showParentLink = false }: Props) {
  const { t } = useLanguage();
  const { user } = useAuth();

  return (
    <header className="bridge-header mx-auto max-w-lg px-4 pb-2">
      <div className="bridge-header__top">
        <div
          className="bridge-header__profile"
          aria-hidden
          title={user?.name ?? "Bridge"}
        >
          {profileInitial}
        </div>

        <div className="bridge-header__brand">
          <span className="bridge-header__logo-mark" aria-hidden>
            🌉
          </span>
          <span className="bridge-header__logo-text">BRIDGE</span>
        </div>

        <div className="bridge-header__actions">
          <div className="bridge-pill-btn">
            <LanguageSwitcher compact />
          </div>
          {showParentLink ? (
            <Link href="/dashboard" className="bridge-pill-btn hidden sm:inline-flex">
              {t("myspace.parent")}
            </Link>
          ) : null}
          <SignOutButton
            variant="myspace"
            className="!min-h-[2.75rem] !rounded-full !border-[var(--bd-border)] !px-3 !text-[0.6875rem]"
            showIcon={false}
          />
        </div>
      </div>
    </header>
  );
}
