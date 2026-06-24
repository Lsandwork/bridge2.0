#!/usr/bin/env node
/** Writes _portal-locale-{vi,ko,ar,ja,hi,ru}.mjs from embedded translation maps. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TRANSLATIONS } from "./portal-translations-embedded.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

for (const [locale, map] of Object.entries(TRANSLATIONS)) {
  const lines = [`export const ${locale} = {`];
  for (const [key, value] of Object.entries(map)) {
    const escaped = value
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n");
    lines.push(`  "${key}": "${escaped}",`);
  }
  lines.push("};");
  lines.push("");
  const out = path.join(__dirname, `_portal-locale-${locale}.mjs`);
  fs.writeFileSync(out, lines.join("\n"), "utf8");
  console.log(`Wrote ${out} (${Object.keys(map).length} keys)`);
}
