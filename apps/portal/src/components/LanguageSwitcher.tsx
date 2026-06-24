"use client";

import { localeLabels, SUPPORTED_LOCALES, type Locale } from "@family-support/core";
import { useLanguage } from "@/components/LanguageProvider";

type Props = {
  compact?: boolean;
};

export function LanguageSwitcher({ compact }: Props) {
  const { locale, setLocale } = useLanguage();

  return (
    <label className={`flex items-center gap-2 ${compact ? "text-xs" : "text-sm"}`}>
      {!compact ? <span className="font-medium text-slate-500">🌐</span> : null}
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className={`rounded-lg border border-slate-200 bg-white font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 ${
          compact ? "min-h-[2.75rem] px-2 py-1.5 text-xs" : "min-h-[2.75rem] px-3 py-2 text-sm"
        }`}
        aria-label="Choose language"
      >
        {SUPPORTED_LOCALES.map((code) => (
          <option key={code} value={code}>
            {localeLabels[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
