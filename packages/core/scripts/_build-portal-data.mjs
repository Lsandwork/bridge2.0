#!/usr/bin/env node
/** Assembles portal-translations.data.mjs from locale modules. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { es, zh } from "./_portal-locale-es-zh.mjs";
import { fr } from "./_portal-locale-fr.mjs";
import { de } from "./_portal-locale-de.mjs";
import { pt } from "./_portal-locale-pt.mjs";
import { vi } from "./_portal-locale-vi.mjs";
import { ko } from "./_portal-locale-ko.mjs";
import { ar } from "./_portal-locale-ar.mjs";
import { ja } from "./_portal-locale-ja.mjs";
import { hi } from "./_portal-locale-hi.mjs";
import { ru } from "./_portal-locale-ru.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EN_FILE = path.resolve(__dirname, "../src/locales/en.ts");
const OUT_FILE = path.resolve(__dirname, "portal-translations.data.mjs");

function parsePortalKeyOrder(content) {
  const keys = [];
  const re = /"((?:therapist|parent|auth|common)\.[^"]+)":/g;
  for (const m of content.matchAll(re)) keys.push(m[1]);
  return keys;
}

const KEY_ORDER = parsePortalKeyOrder(fs.readFileSync(EN_FILE, "utf8"));

const TRANSLATIONS = { es, zh, fr, de, pt, vi, ko, ar, ja, hi, ru };

const locales = ["es", "zh", "fr", "de", "pt", "vi", "ko", "ar", "ja", "hi", "ru"];
const lines = ["export const TRANSLATIONS = {"];

for (const locale of locales) {
  const map = TRANSLATIONS[locale];
  lines.push(`  ${locale}: {`);
  for (const key of KEY_ORDER) {
    const val = map[key];
    if (val == null) throw new Error(`[${locale}] missing key: ${key}`);
    lines.push(`    ${JSON.stringify(key)}: ${JSON.stringify(val)},`);
  }
  lines.push("  },");
}
lines.push("};");
lines.push("");

fs.writeFileSync(OUT_FILE, lines.join("\n"), "utf8");
console.log(`Wrote ${OUT_FILE}`);
for (const loc of locales) {
  console.log(`${loc}: ${Object.keys(TRANSLATIONS[loc]).length} keys`);
}
