#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DE_SITE } from "./site-de-translations.data.mjs";
import { ES_SITE } from "./site-es-translations.data.mjs";
import { FR_SITE } from "./site-fr-translations.data.mjs";
import { ZH_SITE } from "./site-zh-translations.data.mjs";
import { PT_SITE } from "./site-pt-translations.data.mjs";
import { VI_SITE } from "./site-vi-translations.data.mjs";
import { KO_SITE } from "./site-ko-translations.data.mjs";
import { AR_SITE } from "./site-ar-translations.data.mjs";
import { JA_SITE } from "./site-ja-translations.data.mjs";
import { HI_SITE } from "./site-hi-translations.data.mjs";
import { RU_SITE } from "./site-ru-translations.data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.resolve(__dirname, "../src/locales");

const MAP = {
  de: DE_SITE,
  es: ES_SITE,
  fr: FR_SITE,
  zh: ZH_SITE,
  pt: PT_SITE,
  vi: VI_SITE,
  ko: KO_SITE,
  ar: AR_SITE,
  ja: JA_SITE,
  hi: HI_SITE,
  ru: RU_SITE,
};

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeTsString(str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

function upsertKey(content, key, value) {
  const escapedKey = escapeRegExp(key);
  const escapedValue = escapeTsString(value);
  const re = new RegExp(`("${escapedKey}":\\s*")((?:[^"\\\\]|\\\\.)*)(")`);
  if (re.test(content)) {
    return content.replace(re, (_m, prefix, _old, suffix) => `${prefix}${escapedValue}${suffix}`);
  }
  const insertAt = content.lastIndexOf("};");
  const line = `  "${key}": "${escapedValue}",\n`;
  return content.slice(0, insertAt) + line + content.slice(insertAt);
}

for (const [locale, translations] of Object.entries(MAP)) {
  const file = path.join(LOCALES_DIR, `${locale}.ts`);
  let content = fs.readFileSync(file, "utf8");
  for (const [key, value] of Object.entries(translations)) {
    content = upsertKey(content, key, value);
  }
  fs.writeFileSync(file, content);
  console.log(`${locale}: applied ${Object.keys(translations).length} keys`);
}
