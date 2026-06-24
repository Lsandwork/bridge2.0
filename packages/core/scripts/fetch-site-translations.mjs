#!/usr/bin/env node
/**
 * Fetches translations for site i18n keys via MyMemory (free, no key).
 * Run once: node packages/core/scripts/fetch-site-translations.mjs
 * Output: site-content-translations.data.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRAGMENT = path.join(__dirname, "_site-i18n-keys.fragment.ts");
const OUT = path.join(__dirname, "site-content-translations.data.mjs");

const LOCALES = {
  es: "es",
  zh: "zh-CN",
  fr: "fr",
  de: "de",
  pt: "pt",
  vi: "vi",
  ko: "ko",
  ar: "ar",
  ja: "ja",
  hi: "hi",
  ru: "ru",
};

function parseFragment(content) {
  const keys = {};
  const re = /"([^"]+)":\s*"((?:[^"\\]|\\.)*)"/g;
  for (const m of content.matchAll(re)) {
    keys[m[1]] = m[2].replace(/\\"/g, '"').replace(/\\n/g, "\n");
  }
  return keys;
}

function escapeTs(str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

async function translateText(text, lang) {
  if (!text.trim()) return text;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${lang}`;
  const res = await fetch(url);
  const data = await res.json();
  const translated = data?.responseData?.translatedText;
  if (!translated || translated === text) return text;
  return translated;
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const enKeys = parseFragment(fs.readFileSync(FRAGMENT, "utf8"));
  const entries = Object.entries(enKeys);
  /** @type {Record<string, Record<string, string>>} */
  const out = {};

  for (const [locale, lang] of Object.entries(LOCALES)) {
    console.log(`\nTranslating ${locale} (${entries.length} keys)…`);
    out[locale] = {};
    for (let i = 0; i < entries.length; i++) {
      const [key, text] = entries[i];
      try {
        out[locale][key] = await translateText(text, lang);
      } catch {
        out[locale][key] = text;
      }
      if ((i + 1) % 20 === 0) console.log(`  ${i + 1}/${entries.length}`);
      await sleep(350);
    }
  }

  const lines = Object.entries(out).map(([locale, map]) => {
    const pairs = Object.entries(map)
      .map(([k, v]) => `    "${k}": "${escapeTs(v)}",`)
      .join("\n");
    return `  ${locale}: {\n${pairs}\n  }`;
  });

  fs.writeFileSync(
    OUT,
    `/** Auto-generated site translations — do not edit by hand; re-run fetch-site-translations.mjs */\nexport const SITE_TRANSLATIONS = {\n${lines.join(",\n")}\n};\n`
  );
  console.log(`\nWrote ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
