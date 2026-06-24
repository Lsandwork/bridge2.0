"use client";

import { Suspense } from "react";
import PortalLoginPage from "./PortalLoginPage";
import { useLanguage } from "@/components/LanguageProvider";

function LoginFallback() {
  const { t } = useLanguage();
  return (
    <div className="landing-root flex min-h-screen items-center justify-center">
      <p className="text-sm text-slate-400">{t("auth.loading")}</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <PortalLoginPage />
    </Suspense>
  );
}
