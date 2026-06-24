#!/usr/bin/env node
/** Generates _portal-locale-{vi,ko,ar,ja,hi,ru}.mjs from translation parts. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { de } from "./_portal-locale-de.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KEY_ORDER = Object.keys(de);

/** @type {Record<string, Record<string, string>>} */
const LOCALES = {};

// vi from part1 (inline in build script body)
const part1 = await import("./_build-extra-portal-locales-data.mjs");
Object.assign(LOCALES, part1.LOCALES);

for (const part of ["part2", "part3", "part4", "part5"]) {
  const mod = await import(`./_portal-locales-extra-${part}.mjs`);
  Object.assign(LOCALES, mod.LOCALES);
}

const needed = ["vi", "ko", "ar", "ja", "hi", "ru"];
for (const locale of needed) {
  const map = LOCALES[locale];
  if (!map) throw new Error(`Missing locale: ${locale}`);
  for (const key of KEY_ORDER) {
    if (map[key] == null) throw new Error(`[${locale}] missing key: ${key}`);
  }
  const extraKeys = Object.keys(map).filter((k) => !KEY_ORDER.includes(k));
  if (extraKeys.length) {
    throw new Error(`[${locale}] extra keys: ${extraKeys.join(", ")}`);
  }

  const lines = [`export const ${locale} = {`];
  for (const key of KEY_ORDER) {
    lines.push(`  ${JSON.stringify(key)}: ${JSON.stringify(map[key])},`);
  }
  lines.push("};");
  lines.push("");
  const out = path.join(__dirname, `_portal-locale-${locale}.mjs`);
  fs.writeFileSync(out, lines.join("\n"), "utf8");
  console.log(`Wrote ${out} (${KEY_ORDER.length} keys)`);
}
