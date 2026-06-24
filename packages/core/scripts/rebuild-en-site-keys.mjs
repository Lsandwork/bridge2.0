#!/usr/bin/env node
/** Rebuilds site keys section in en.ts from fragment (fixes $ corruption). */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EN_FILE = path.resolve(__dirname, "../src/locales/en.ts");
const FRAGMENT = path.join(__dirname, "_site-i18n-keys.fragment.ts");

const SITE_PREFIXES = [
  "exercises.", "landing.", "library.", "pricing.", "socialStories.", "tess.", "common.safetyDisclaimer",
];

function parseFragment(content) {
  const keys = {};
  const re = /"([^"]+)":\s*"((?:[^"\\]|\\.)*)"/g;
  for (const m of content.matchAll(re)) keys[m[1]] = m[2].replace(/\\"/g, '"').replace(/\\n/g, "\n");
  return keys;
}

function escapeTs(str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

const enContent = fs.readFileSync(EN_FILE, "utf8");
const fragmentKeys = parseFragment(fs.readFileSync(FRAGMENT, "utf8"));

const kept = [];
for (const line of enContent.split("\n")) {
  const m = line.match(/^\s*"([^"]+)":/);
  if (m && SITE_PREFIXES.some((p) => m[1].startsWith(p) || m[1] === "common.safetyDisclaimer")) continue;
  kept.push(line);
}

let body = kept.join("\n");
const insertAt = body.lastIndexOf("};");
const lines = Object.entries(fragmentKeys)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([k, v]) => `  "${k}": "${escapeTs(v)}",`)
  .join("\n");

body = body.slice(0, insertAt) + lines + "\n" + body.slice(insertAt);
fs.writeFileSync(EN_FILE, body);
console.log(`Rebuilt en.ts with ${Object.keys(fragmentKeys).length} site keys`);
