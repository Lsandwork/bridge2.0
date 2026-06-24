"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import {
  CHILD_QUICK_BUTTONS,
  PARENT_QUICK_PROMPTS,
  type TessQuickAction,
} from "@family-support/core";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { useTessWidgetProfile } from "@/hooks/useTessWidgetProfile";
import { TessChat } from "@/components/tess/TessChat";
import { TessIcon } from "@/components/tess/TessIcon";
import "./tess-bubble.css";

const PUBLIC_ROUTES = new Set(["/", "/login", "/onboarding"]);
const PUBLIC_PREFIXES = ["/setup"];

function isPublicRoute(pathname: string) {
  if (PUBLIC_ROUTES.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

function isFullScreenTessRoute(pathname: string) {
  return (
    pathname === "/tess/chat" ||
    pathname === "/my-space/tess/chat" ||
    pathname === "/my-space/tess/voice"
  );
}

function quickActionsForRole(role: string | undefined, isChildContext: boolean): TessQuickAction[] {
  if (role === "child_user" || isChildContext) {
    return CHILD_QUICK_BUTTONS.slice(0, 6);
  }
  return PARENT_QUICK_PROMPTS.slice(0, 5);
}

function fullChatHref(role: string | undefined, pathname: string): string {
  if (role === "child_user" || pathname.startsWith("/my-space")) {
    return "/my-space/tess/chat";
  }
  return "/tess/chat";
}

export function TessAssistantBubble() {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const { profiles, profileId, activeProfile, setProfileId, loading: profileLoading } =
    useTessWidgetProfile();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  const isMySpace = pathname.startsWith("/my-space");
  const isMySpaceHome = pathname === "/my-space";
  const shouldRender =
    !authLoading &&
    Boolean(user) &&
    !isPublicRoute(pathname) &&
    !isFullScreenTessRoute(pathname) &&
    !isMySpaceHome;

  const quickActions = useMemo(
    () => quickActionsForRole(user?.role, isMySpace),
    [user?.role, isMySpace]
  );

  const chatHref = fullChatHref(user?.role, pathname);

  const close = useCallback(() => {
    setOpen(false);
    fabRef.current?.focus();
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>("input, textarea, button")?.focus();
    }, 80);
    return () => window.clearTimeout(timer);
  }, [open]);

  if (!shouldRender) return null;

  return (
    <div className="tess-bubble-root" data-my-space={isMySpace ? "true" : "false"}>
      {open ? (
        <button
          type="button"
          className="tess-bubble-backdrop"
          aria-label={t("tess.bubble.close")}
          onClick={close}
        />
      ) : null}

      {open ? (
        <div
          ref={panelRef}
          className="tess-bubble-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tess-bubble-title"
        >
          <div className="tess-bubble-toolbar">
            <div className="min-w-0">
              <p id="tess-bubble-title" className="tess-bubble-toolbar-title">
                {t("tess.bubble.title")}
              </p>
              <p className="tess-bubble-toolbar-sub">{t("tess.bubble.subtitle")}</p>
              {profiles.length > 1 ? (
                <label className="tess-bubble-profile">
                  <span>{t("tess.bubble.profile")}</span>
                  <select
                    value={profileId}
                    onChange={(e) => setProfileId(e.target.value)}
                    disabled={profileLoading}
                    aria-label={t("tess.bubble.profile")}
                  >
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : activeProfile ? (
                <p className="tess-bubble-profile">
                  {t("tess.bubble.forProfile", { name: activeProfile.name })}
                </p>
              ) : null}
            </div>
            <button type="button" className="tess-bubble-close" onClick={close} aria-label={t("tess.bubble.close")}>
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="tess-bubble-body">
            <TessChat
              key={`${profileId}-${pathname}`}
              childProfileId={profileId}
              userName={activeProfile?.name ?? "friend"}
              quickActions={quickActions}
              placeholder={t("tess.bubble.placeholder")}
              defaultInputMode="text"
              embedded
            />
          </div>

          <div className="tess-bubble-footer">
            <Link href={chatHref} onClick={close}>
              {t("tess.bubble.openFull")} →
            </Link>
          </div>
        </div>
      ) : null}

      <button
        ref={fabRef}
        type="button"
        className="tess-bubble-fab"
        aria-expanded={open}
        aria-controls={open ? "tess-bubble-title" : undefined}
        aria-label={open ? t("tess.bubble.close") : t("tess.bubble.open")}
        onClick={() => setOpen((prev) => !prev)}
      >
        {!open ? <span className="tess-bubble-fab-pulse" aria-hidden /> : null}
        {open ? (
          <X className="h-6 w-6" aria-hidden />
        ) : (
          <TessIcon size={30} decorative className="tess-bubble-fab__icon" />
        )}
      </button>
    </div>
  );
}
