import { bundles } from "./locales/index";
import { en } from "./locales/en";

export type Locale =
  | "en"
  | "es"
  | "zh"
  | "fr"
  | "de"
  | "pt"
  | "vi"
  | "ko"
  | "ar"
  | "ja"
  | "hi"
  | "ru";

export const SUPPORTED_LOCALES: Locale[] = [
  "en",
  "es",
  "zh",
  "fr",
  "de",
  "pt",
  "vi",
  "ko",
  "ar",
  "ja",
  "hi",
  "ru",
];

export const localeLabels: Record<Locale, string> = {
  en: "English",
  es: "Español",
  zh: "中文",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  vi: "Tiếng Việt",
  ko: "한국어",
  ar: "العربية",
  ja: "日本語",
  hi: "हिन्दी",
  ru: "Русский",
};

export const localeSpeechCodes: Record<Locale, string> = {
  en: "en-US",
  es: "es-ES",
  zh: "zh-CN",
  fr: "fr-FR",
  de: "de-DE",
  pt: "pt-BR",
  vi: "vi-VN",
  ko: "ko-KR",
  ar: "ar-SA",
  ja: "ja-JP",
  hi: "hi-IN",
  ru: "ru-RU",
};

export const rtlLocales: Locale[] = ["ar"];

/** Maps stored English AAC phrases to i18n keys for localized display & speech. */
export const PHRASE_TO_I18N_KEY: Record<string, string> = {
  "I'm hungry": "talk.phrase.imHungry",
  "More please": "talk.phrase.morePlease",
  "I need the bathroom": "talk.phrase.bathroom",
  "I feel happy": "talk.phrase.feelHappy",
  "I feel overwhelmed": "talk.phrase.feelOverwhelmed",
  "I need help": "talk.phrase.needHelp",
  "I need a break": "talk.phrase.needBreak",
  Stop: "talk.phrase.stop",
  Yes: "talk.phrase.yes",
  No: "talk.phrase.no",
  Mom: "talk.phrase.mom",
  "Play outside": "talk.phrase.playOutside",
  "I need space": "talk.phrase.needSpace",
};

export type TranslateFn = (key: string) => string;

export function translate(locale: Locale, key: string): string {
  return bundles[locale][key] ?? en[key] ?? key;
}

export function translateWithParams(locale: Locale, key: string, params: Record<string, string>): string {
  let text = translate(locale, key);
  for (const [name, value] of Object.entries(params)) {
    text = text.replace(`{${name}}`, value);
  }
  return text;
}

export function translateCategory(locale: Locale, category: string): string {
  return translate(locale, `talk.category.${category}`);
}

export function translatePhrase(locale: Locale, phrase: string): string {
  const key = PHRASE_TO_I18N_KEY[phrase];
  return key ? translate(locale, key) : phrase;
}

export function isRtl(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}
