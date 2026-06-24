"use client";

import { useLanguage } from "@/components/LanguageProvider";

export function LoadingBlock({ label }: { label?: string }) {
  const { t } = useLanguage();
  return (
    <section className="card mx-auto m-4 max-w-7xl p-6 text-stone-700 md:m-8">{label ?? t("common.loading")}</section>
  );
}

export function ErrorBlock({ message }: { message: string }) {
  return (
    <section className="card mx-auto m-4 max-w-7xl p-6 text-red-700 md:m-8">{message}</section>
  );
}

export function EmptyBlock({ message, title, description }: { message?: string; title?: string; description?: string }) {
  const { t } = useLanguage();
  return (
    <section className="card mx-auto m-4 max-w-7xl p-6 text-stone-500 md:m-8">
      {title ? <p className="font-semibold text-stone-700">{title}</p> : null}
      <p className={title ? "mt-1 text-sm" : undefined}>{description ?? message ?? t("common.empty")}</p>
    </section>
  );
}
