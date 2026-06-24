#!/usr/bin/env node
/** Removes site i18n keys from non-en locale files (fixes bad API translations). */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.resolve(__dirname, "../src/locales");
const LOCALES = ["es", "zh", "fr", "de", "pt", "vi", "ko", "ar", "ja", "hi", "ru"];

const SITE_PREFIXES = [
  "exercises.", "landing.", "library.", "pricing.", "socialStories.", "tess.",
];
const SITE_EXACT = new Set(["common.safetyDisclaimer"]);

function isSiteKey(key) {
  return SITE_EXACT.has(key) || SITE_PREFIXES.some((p) => key.startsWith(p));
}

for (const locale of LOCALES) {
  const file = path.join(LOCALES_DIR, `${locale}.ts`);
  const lines = fs.readFileSync(file, "utf8").split("\n");
  const kept = lines.filter((line) => {
    const m = line.match(/^\s*"([^"]+)":/);
    if (!m) return true;
    return !isSiteKey(m[1]);
  });
  fs.writeFileSync(file, kept.join("\n"));
  console.log(`Stripped site keys from ${locale}.ts`);
}
