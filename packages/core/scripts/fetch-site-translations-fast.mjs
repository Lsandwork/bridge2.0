#!/usr/bin/env node
/** Parallel site translations via MyMemory (batched). */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRAGMENT = path.join(__dirname, "_site-i18n-keys.fragment.ts");
const OUT = path.join(__dirname, "site-content-translations.data.mjs");

const LOCALES = {
  es: "es", zh: "zh-CN", fr: "fr", de: "de", pt: "pt", vi: "vi", ko: "ko", ar: "ar", ja: "ja", hi: "hi", ru: "ru",
};

function parseFragment(content) {
  const keys = {};
  const re = /"([^"]+)":\s*"((?:[^"\\]|\\.)*)"/g;
  for (const m of content.matchAll(re)) keys[m[1]] = m[2].replace(/\\"/g, '"').replace(/\\n/g, "\n");
  return keys;
}

function escapeTs(str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

async function translateText(text, lang) {
  if (!text.trim() || text.length > 450) {
    if (text.length > 450) {
      const parts = text.match(/.{1,400}(?:\s|$)/g) ?? [text];
      const out = [];
      for (const part of parts) out.push(await translateText(part.trim(), lang));
      return out.join(" ");
    }
    return text;
  }
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${lang}`;
  const res = await fetch(url);
  const data = await res.json();
  return data?.responseData?.translatedText ?? text;
}

async function mapPool(items, fn, concurrency = 8) {
  const results = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

async function main() {
  const enKeys = parseFragment(fs.readFileSync(FRAGMENT, "utf8"));
  const entries = Object.entries(enKeys);
  /** @type {Record<string, Record<string, string>>} */
  const out = {};

  for (const [locale, lang] of Object.entries(LOCALES)) {
    console.log(`Translating ${locale} (${entries.length} keys, parallel)…`);
    out[locale] = {};
    await mapPool(
      entries,
      async ([key, text]) => {
        out[locale][key] = await translateText(text, lang);
        await new Promise((r) => setTimeout(r, 120));
      },
      6
    );
    console.log(`  done ${locale}`);
  }

  const lines = Object.entries(out).map(([locale, map]) => {
    const pairs = Object.entries(map).map(([k, v]) => `    "${k}": "${escapeTs(v)}",`).join("\n");
    return `  ${locale}: {\n${pairs}\n  }`;
  });

  fs.writeFileSync(
    OUT,
    `/** Auto-generated site translations */\nexport const SITE_TRANSLATIONS = {\n${lines.join(",\n")}\n};\n`
  );
  console.log(`Wrote ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
