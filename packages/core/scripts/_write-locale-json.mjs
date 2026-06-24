#!/usr/bin/env node
/** Writes locale JSON shards used to build portal-translations.data.mjs */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EN_FILE = path.resolve(__dirname, "../src/locales/en.ts");

function parsePortalKeys(content) {
  const keys = [];
  const re = /"((?:therapist|parent)\.[^"]+)":\s*"((?:[^"\\]|\\.)*)"/g;
  for (const m of content.matchAll(re)) keys.push(m[1]);
  return keys;
}

const KEY_ORDER = parsePortalKeys(fs.readFileSync(EN_FILE, "utf8"));

/** Build locale map from English values using per-locale string transforms. */
function buildFromEnglish(locale, transform) {
  const enContent = fs.readFileSync(EN_FILE, "utf8");
  const re = /"((?:therapist|parent)\.[^"]+)":\s*"((?:[^"\\]|\\.)*)"/g;
  const map = {};
  for (const m of enContent.matchAll(re)) {
    const key = m[1];
    const en = m[2].replace(/\\"/g, '"').replace(/\\n/g, "\n");
    map[key] = transform(key, en);
  }
  return map;
}

// Import hand-crafted overrides from sibling modules
const overrides = {};
for (const loc of ["fr", "de", "pt", "vi", "ko", "ar", "ja", "hi", "ru"]) {
  const p = path.join(__dirname, `_overrides-${loc}.mjs`);
  if (fs.existsSync(p)) {
    overrides[loc] = (await import(p)).default;
  }
}

for (const [locale, data] of Object.entries(overrides)) {
  const missing = KEY_ORDER.filter((k) => data[k] == null);
  if (missing.length) {
    console.error(`${locale}: missing ${missing.length} keys`, missing.slice(0, 5));
    process.exit(1);
  }
  fs.writeFileSync(
    path.join(__dirname, `_locale-${locale}.json`),
    JSON.stringify(data, null, 0),
    "utf8",
  );
  console.log(`${locale}: ${Object.keys(data).length} keys written`);
}
