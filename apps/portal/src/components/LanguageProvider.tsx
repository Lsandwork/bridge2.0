"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { type Locale, SUPPORTED_LOCALES, isRtl, translate, translateCategory, translatePhrase, translateWithParams } from "@family-support/core";

const STORAGE_KEY = "bridge-locale";

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
  return saved && SUPPORTED_LOCALES.includes(saved) ? saved : "en";
}

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string>) => string;
  tPhrase: (phrase: string) => string;
  tCategory: (category: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    setLocaleState(readStoredLocale());
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
    document.documentElement.dir = isRtl(next) ? "rtl" : "ltr";
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtl(locale) ? "rtl" : "ltr";
  }, [locale]);

  const t = useCallback(
    (key: string, params?: Record<string, string>) =>
      params ? translateWithParams(locale, key, params) : translate(locale, key),
    [locale]
  );

  const tPhrase = useCallback((phrase: string) => translatePhrase(locale, phrase), [locale]);
  const tCategory = useCallback((category: string) => translateCategory(locale, category), [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, tPhrase, tCategory }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
