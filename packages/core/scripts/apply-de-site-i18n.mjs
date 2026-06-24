#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DE_SITE } from "./site-de-translations.data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DE_FILE = path.resolve(__dirname, "../src/locales/de.ts");

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

let content = fs.readFileSync(DE_FILE, "utf8");
for (const [key, value] of Object.entries(DE_SITE)) {
  content = upsertKey(content, key, value);
}
fs.writeFileSync(DE_FILE, content);
console.log(`Applied ${Object.keys(DE_SITE).length} German site keys to de.ts`);
