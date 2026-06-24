#!/usr/bin/env node
/**
 * Merges site i18n keys (pricing.*, library.*, landing.*, etc.) into locale TS files.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_TRANSLATIONS } from "./site-content-translations.data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.resolve(__dirname, "../src/locales");
const FRAGMENT = path.join(__dirname, "_site-i18n-keys.fragment.ts");
const TARGET_LOCALES = ["en", "es", "zh", "fr", "de", "pt", "vi", "ko", "ar", "ja", "hi", "ru"];

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeTsString(str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

function parseFragment(content) {
  /** @type {Record<string, string>} */
  const keys = {};
  const re = /"([^"]+)":\s*"((?:[^"\\]|\\.)*)"/g;
  for (const m of content.matchAll(re)) {
    keys[m[1]] = m[2].replace(/\\"/g, '"').replace(/\\n/g, "\n");
  }
  return keys;
}

function upsertKey(content, key, value) {
  const escapedKey = escapeRegExp(key);
  const escapedValue = escapeTsString(value);
  const re = new RegExp(`("${escapedKey}":\\s*")((?:[^"\\\\]|\\\\.)*)(")`);
  if (re.test(content)) {
    return content.replace(re, (_m, prefix, _old, suffix) => `${prefix}${escapedValue}${suffix}`);
  }
  const insertAt = content.lastIndexOf("};");
  if (insertAt < 0) throw new Error("Could not find closing }; in locale file");
  const line = `  "${key}": "${escapedValue}",\n`;
  return content.slice(0, insertAt) + line + content.slice(insertAt);
}

function main() {
  const enKeys = parseFragment(fs.readFileSync(FRAGMENT, "utf8"));
  console.log(`Merging ${Object.keys(enKeys).length} site keys…`);

  for (const locale of TARGET_LOCALES) {
    const file = path.join(LOCALES_DIR, `${locale}.ts`);
    let content = fs.readFileSync(file, "utf8");
    const translations = locale === "en" ? enKeys : SITE_TRANSLATIONS[locale];
    let added = 0;

    for (const [key, enValue] of Object.entries(enKeys)) {
      const value = translations?.[key] ?? enValue;
      const before = content;
      content = upsertKey(content, key, value);
      if (content !== before) added++;
    }

    fs.writeFileSync(file, content);
    console.log(`  ${locale}: updated ${added} keys`);
  }
}

main();
