#!/usr/bin/env node
/**
 * Applies native portal translations (therapist.* + parent.*) to locale TS files.
 * Reads keys from en.ts and replaces values via regex on each locale file.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TRANSLATIONS } from "./portal-translations.data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.resolve(__dirname, "../src/locales");
const EN_FILE = path.join(LOCALES_DIR, "en.ts");
const TARGET_LOCALES = ["es", "zh", "fr", "de", "pt", "vi", "ko", "ar", "ja", "hi", "ru"];

/** Keys whose English value may remain unchanged (brand names, etc.). */
const ALLOWED_IDENTICAL_KEYS = new Set([
  "parent.header.fallbackTitle", // Bridge brand
]);

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeTsString(str) {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");
}

function parsePortalKeys(content) {
  const keys = {};
  const re = /"((?:therapist|parent|auth|common)\.[^"]+)":\s*"((?:[^"\\]|\\.)*)"/g;
  for (const m of content.matchAll(re)) {
    keys[m[1]] = m[2].replace(/\\"/g, '"').replace(/\\n/g, "\n");
  }
  return keys;
}

function isAcceptableIdentical(key, enValue, locValue) {
  if (enValue !== locValue) return true;
  return ALLOWED_IDENTICAL_KEYS.has(key);
}

function replaceKeyValue(content, key, newValue) {
  const escapedKey = escapeRegExp(key);
  const escapedValue = escapeTsString(newValue);
  const re = new RegExp(
    `("${escapedKey}":\\s*")((?:[^"\\\\]|\\\\.)*)(")`,
    "g",
  );
  if (!re.test(content)) {
    return { content, updated: false };
  }
  const next = content.replace(
    new RegExp(`("${escapedKey}":\\s*")((?:[^"\\\\]|\\\\.)*)(")`, "g"),
    `$1${escapedValue}$3`,
  );
  return { content: next, updated: true };
}

function main() {
  const enContent = fs.readFileSync(EN_FILE, "utf8");
  const enKeys = parsePortalKeys(enContent);
  const portalKeyCount = Object.keys(enKeys).length;

  console.log(`Found ${portalKeyCount} portal keys in en.ts\n`);

  const summary = [];

  for (const locale of TARGET_LOCALES) {
    const localeFile = path.join(LOCALES_DIR, `${locale}.ts`);
    let content = fs.readFileSync(localeFile, "utf8");
    const translations = TRANSLATIONS[locale];

    if (!translations) {
      console.error(`Missing translations for locale: ${locale}`);
      process.exitCode = 1;
      continue;
    }

    let updated = 0;
    let missing = 0;

    for (const key of Object.keys(enKeys)) {
      const translated = translations[key];
      if (translated == null) {
        missing++;
        console.warn(`  [${locale}] missing translation for: ${key}`);
        continue;
      }
      const result = replaceKeyValue(content, key, translated);
      if (result.updated) {
        content = result.content;
        updated++;
      }
    }

    fs.writeFileSync(localeFile, content, "utf8");

    const afterContent = fs.readFileSync(localeFile, "utf8");
    const afterKeys = parsePortalKeys(afterContent);
    const identical = Object.keys(enKeys).filter((k) => {
      const enVal = enKeys[k];
      const locVal = afterKeys[k];
      if (enVal === locVal) {
        return !isAcceptableIdentical(k, enVal, locVal);
      }
      return false;
    });

    summary.push({ locale, updated, missing, identical: identical.length, identicalKeys: identical });
    console.log(`${locale}: updated ${updated} keys${missing ? `, ${missing} missing` : ""}`);
  }

  console.log("\n--- Verification ---");
  let allOk = true;
  for (const row of summary) {
    const status = row.identical === 0 ? "OK" : "WARN";
    if (row.identical > 0) allOk = false;
    console.log(
      `${row.locale}: ${row.updated} updated, ${row.identical} still identical to English ${status}`,
    );
    if (row.identical > 0 && row.identical <= 10) {
      for (const k of row.identicalKeys) {
        console.log(`    - ${k}: "${enKeys[k]}"`);
      }
    } else if (row.identical > 10) {
      console.log(`    (first 10: ${row.identicalKeys.slice(0, 10).join(", ")})`);
    }
  }

  if (!allOk) {
    process.exitCode = 1;
  } else {
    console.log("\nAll portal keys translated (brand names preserved where appropriate).");
  }
}

main();
