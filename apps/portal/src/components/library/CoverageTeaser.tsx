"use client";

import Link from "next/link";
import { getLocalizedCoverageOptions } from "@family-support/core";
import { useLanguage } from "@/components/LanguageProvider";

export function CoverageTeaser() {
  const { t } = useLanguage();
  const coverageOptions = getLocalizedCoverageOptions(t);

  return (
    <section className="library-card overflow-hidden">
      <div className="border-b border-stone-200 bg-stone-50 px-6 py-4">
        <h2 className="text-lg font-bold text-stone-900">{t("library.coverageTitle")}</h2>
        <p className="mt-1 text-sm text-stone-600">{t("library.coverageSubtitle")}</p>
      </div>
      <div className="grid gap-0 divide-y divide-stone-100 bg-white md:grid-cols-2 md:divide-x md:divide-y-0">
        {coverageOptions.slice(0, 4).map((option) => (
          <div key={option.id} className="p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-brand">{option.priceLabel}</p>
            <h3 className="mt-1 font-bold text-stone-900">{option.title}</h3>
            <p className="mt-1 text-sm text-stone-600">{option.bestFor}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 bg-stone-50 px-6 py-4">
        <p className="max-w-2xl text-xs leading-relaxed text-stone-600">{t("library.legalNotice")}</p>
        <Link
          href="/pricing#insurance"
          className="shrink-0 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
        >
          {t("library.comparePayment")}
        </Link>
      </div>
    </section>
  );
}
