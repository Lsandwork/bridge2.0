#!/usr/bin/env node
/** Merges site i18n keys into en.ts only (fast path before translations land). */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EN_FILE = path.resolve(__dirname, "../src/locales/en.ts");
const FRAGMENT = path.join(__dirname, "_site-i18n-keys.fragment.ts");

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeTsString(str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

function parseFragment(content) {
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
  const line = `  "${key}": "${escapedValue}",\n`;
  return content.slice(0, insertAt) + line + content.slice(insertAt);
}

const keys = parseFragment(fs.readFileSync(FRAGMENT, "utf8"));
let content = fs.readFileSync(EN_FILE, "utf8");
for (const [key, value] of Object.entries(keys)) {
  content = upsertKey(content, key, value);
}
fs.writeFileSync(EN_FILE, content);
console.log(`Merged ${Object.keys(keys).length} keys into en.ts`);
